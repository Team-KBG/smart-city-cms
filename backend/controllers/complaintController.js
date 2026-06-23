const Complaint = require('../Models/Complaint');
const mongoose = require('mongoose');
const { generateComplaintId } = require('../services/complaintIdService');
const { detectPriority, getEffectivePriority } = require('../services/priorityService');
const { suggestCategory } = require('../services/categorizationService');
const { findNearbyComplaints } = require('../services/geospatialService');
const {
  notifyComplaintRegistered,
  notifyStatusUpdated,
  notifyComplaintResolved,
  notifyComplaintAssigned,
} = require('../services/notificationService');
const {
  onComplaintSubmitted,
  onComplaintUpvote,
  onGenuineComplaint,
} = require('../services/reputationService');
const { EMERGENCY_CATEGORIES, CATEGORY_DEPARTMENT_MAP, SLA_HOURS } = require('../config/constants');
const logger = require('../utils/logger');

/** Validate and parse coordinate values safely */
function parseCoordinates(longitude, latitude) {
  const lng = parseFloat(longitude);
  const lat = parseFloat(latitude);

  if (isNaN(lng) || isNaN(lat)) return null;
  if (lng < -180 || lng > 180) return null;
  if (lat < -90 || lat > 90) return null;

  return { lng, lat };
}

/** Extract Area name from address */
function extractArea(address = "") {
  if (!address) return "Unknown";
  const sectorMatch = address.match(/Sector\s*[-–—]?\s*([a-zA-Z0-9]+)/i);
  if (sectorMatch) {
    return `Sector ${sectorMatch[1]}`;
  }
  const parts = address.split(',');
  if (parts.length > 0) {
    const trimmed = parts[0].trim();
    if (trimmed && trimmed.length < 30) {
      return trimmed;
    }
  }
  return "Unknown";
}

/** Calculate SLA deadline based on priority */
function calculateSLADeadline(priority) {
  const hours = SLA_HOURS[priority] || 168;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

// ─────────────────────────────────────────────
// Check for nearby similar complaints before creating
// ─────────────────────────────────────────────
exports.checkNearby = async (req, res, next) => {
  try {
    const { longitude, latitude, category } = req.query;

    if (!longitude || !latitude || !category) {
      return res.status(400).json({
        success: false,
        message: 'longitude, latitude, and category are required',
      });
    }

    const coords = parseCoordinates(longitude, latitude);
    if (!coords) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.',
      });
    }

    const nearby = await findNearbyComplaints(coords.lng, coords.lat, category);

    res.status(200).json({
      success: true,
      hasSimilar: nearby.length > 0,
      count: nearby.length,
      data: nearby,
      message:
        nearby.length > 0
          ? 'Similar complaint already registered. Do you want to support it?'
          : 'No similar complaints found nearby.',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// Create a new complaint
// ─────────────────────────────────────────────
exports.createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category: userCategory,
      address,
      longitude,
      latitude,
      citizenEmail,
      citizenName,
      supportExistingId,
      bypassDuplicateCheck,
    } = req.body;

    // Phase 1 - 4. Complaint Form Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (!userCategory || !userCategory.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ success: false, message: 'Location is required (both latitude and longitude)' });
    }

    const coords = parseCoordinates(longitude, latitude);
    if (!coords) {
      return res.status(400).json({ success: false, message: 'Invalid location coordinates' });
    }

    // Redirect to upvote if user wants to support existing complaint
    if (supportExistingId) {
      const existing = await Complaint.findById(supportExistingId) || await Complaint.findOne({ complaintId: supportExistingId });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Complaint to support not found' });
      }
      req.params.id = existing._id;
      return exports.upvoteComplaint(req, res, next);
    }

    const categorization = suggestCategory(title, description, userCategory);
    let priority = detectPriority(title, description, categorization.category);
    
    const textLower = `${title} ${description}`.toLowerCase();
    const hasTransformerBlast = textLower.includes("transformer blast") || textLower.includes("transformer explosion");

    let isEmergency =
      EMERGENCY_CATEGORIES.includes(categorization.category) || 
      categorization.isEmergency ||
      hasTransformerBlast;

    // Phase 2 - 9. Emergency Auto Flag
    if (isEmergency || ['Fire', 'Gas Leakage', 'Accident'].includes(categorization.category)) {
      isEmergency = true;
      priority = 'Critical';
    }

    // Phase 2 - 7. Duplicate Complaint Detection (backend check)
    if (!bypassDuplicateCheck) {
      const nearby = await findNearbyComplaints(coords.lng, coords.lat, categorization.category, 100);
      if (nearby && nearby.length > 0) {
        return res.status(409).json({
          success: false,
          isDuplicate: true,
          message: 'Similar complaint already exists. Support existing complaint instead?',
          data: nearby[0],
        });
      }
    }

    // Phase 1 - 2. Area extraction from complaint location/address
    const area = extractArea(address);

    const complaintData = {
      complaintId: generateComplaintId(),
      title: title.trim(),
      description: description.trim(),
      category: categorization.category,
      department: categorization.department || CATEGORY_DEPARTMENT_MAP[categorization.category],
      address: address ? address.trim() : '',
      area,
      priority,
      effectivePriority: priority,
      isEmergency,
      citizenEmail: citizenEmail ? citizenEmail.toLowerCase().trim() : '',
      citizenName: citizenName ? citizenName.trim() : '',
      autoCategorized: !userCategory,
      slaDeadline: calculateSLADeadline(priority),
      statusHistory: [{
        status: 'Pending',
        note: 'Complaint registered',
        changedAt: new Date(),
        changedBy: req.user ? req.user._id : null,
      }],
    };

    // Attach logged-in citizen reference
    if (req.user) {
      complaintData.citizen = req.user._id;
      complaintData.citizenEmail = req.user.email;
      complaintData.citizenName = req.user.name;
    }

    // Attach coordinates
    complaintData.location = {
      type: 'Point',
      coordinates: [coords.lng, coords.lat],
    };

    if (req.file) {
      complaintData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create(complaintData);

    // Award reputation points
    const emailForReputation = complaintData.citizenEmail;
    if (emailForReputation) {
      await onComplaintSubmitted(emailForReputation, complaintData.citizenName);
    }

    // Send email notification (non-blocking)
    notifyComplaintRegistered(complaint).catch((e) =>
      logger.warn('Email notification failed', { error: e.message })
    );

    logger.info('Complaint created', { complaintId: complaint.complaintId, category: complaint.category });

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      data: complaint,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// Get all complaints (admin/public with pagination)
// ─────────────────────────────────────────────
exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, emergency, department, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (emergency === 'true') filter.isEmergency = true;

    const skip = (Number(page) - 1) * Number(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .select('-supportedBy -__v')
        .sort({ isEmergency: -1, effectivePriority: -1, supportCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: complaints,
    });
  } catch (err) {
    next(err);
  }
};

// Track complaint by readable complaint ID
exports.getComplaintByComplaintId = async (req, res, next) => {
  try {
    const complaint = await findComplaintByIdOrComplaintId(req.params.complaintId);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// Helper helper to query complaint by _id or complaintId
async function findComplaintByIdOrComplaintId(id) {
  let complaint;
  if (mongoose.Types.ObjectId.isValid(id)) {
    complaint = await Complaint.findById(id).populate('statusHistory.changedBy', 'name role department');
  }
  if (!complaint) {
    complaint = await Complaint.findOne({ complaintId: id }).populate('statusHistory.changedBy', 'name role department');
  }
  return complaint;
}

// Get single complaint by MongoDB ID or complaintId
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await findComplaintByIdOrComplaintId(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

exports.updateComplaint = async (req, res, next) => {
  try {
    const complaint = await findComplaintByIdOrComplaintId(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const oldStatus = complaint.status;
    const { status, department, priority, note } = req.body;

    // Role-based restrictions: Department staff can only update complaints within their department
    if (req.user && req.user.role === 'department_staff') {
      if (complaint.department !== req.user.department) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update complaints assigned to your department.',
        });
      }
      if (department && department !== complaint.department) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Department staff cannot reassign complaints.',
        });
      }
      if (priority && priority !== complaint.priority) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Department staff cannot change priority.',
        });
      }
    }

    if (department) complaint.department = department;
    if (priority) {
      complaint.priority = priority;
      complaint.effectivePriority = getEffectivePriority(priority, complaint.supportCount);
      complaint.slaDeadline = calculateSLADeadline(priority);
    }

    if (status && status !== oldStatus) {
      complaint.status = status;
      if (!complaint.statusHistory) {
        complaint.statusHistory = [];
      }
      complaint.statusHistory.push({
        status,
        note: note || `Status changed to ${status}`,
        changedAt: new Date(),
        changedBy: req.user ? req.user._id : null,
      });

      if (status === 'Assigned') {
        if (!complaint.assignedAt) {
          complaint.assignedAt = new Date();
        }
        notifyComplaintAssigned(complaint).catch((e) =>
          logger.warn('Assignment email failed', { error: e.message })
        );
      } else if (status === 'Resolved') {
        complaint.resolvedAt = new Date();
        if (complaint.citizenEmail) {
          await onGenuineComplaint(complaint.citizenEmail);
        }
        notifyComplaintResolved(complaint).catch((e) =>
          logger.warn('Resolution email failed', { error: e.message })
        );
      } else {
        notifyStatusUpdated(complaint, oldStatus).catch((e) =>
          logger.warn('Status email failed', { error: e.message })
        );
      }
    }

    await complaint.save();
    logger.info('Complaint updated', { complaintId: complaint.complaintId, status: complaint.status });

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// Delete complaint (admin only)
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await findComplaintByIdOrComplaintId(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    await Complaint.findByIdAndDelete(complaint._id);
    logger.info('Complaint deleted', { complaintId: complaint.complaintId });
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Upvote / support or remove support from a complaint
exports.upvoteComplaint = async (req, res, next) => {
  try {
    const { citizenEmail } = req.body;
    const email = req.user ? req.user.email : citizenEmail;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to support a complaint' });
    }

    const complaint = await findComplaintByIdOrComplaintId(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const hasSupported = complaint.supportedBy.includes(email);

    if (hasSupported) {
      // Remove support
      complaint.supportCount = Math.max(0, complaint.supportCount - 1);
      complaint.supportedBy = complaint.supportedBy.filter(e => e !== email);
    } else {
      // Add support
      complaint.supportCount += 1;
      complaint.supportedBy.push(email);
      await onComplaintUpvote(email);
    }

    complaint.effectivePriority = getEffectivePriority(complaint.priority, complaint.supportCount);
    await complaint.save();

    res.status(200).json({
      success: true,
      supported: !hasSupported,
      message: hasSupported ? 'Support removed successfully' : 'Complaint supported successfully',
      data: { supportCount: complaint.supportCount, effectivePriority: complaint.effectivePriority },
    });
  } catch (err) {
    next(err);
  }
};

// AI categorization preview
exports.previewCategorization = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const result = suggestCategory(title, description, null);
    const priority = detectPriority(title, description, result.category);

    res.status(200).json({
      success: true,
      data: { ...result, priority },
    });
  } catch (err) {
    next(err);
  }
};

// Heat map data (public)
exports.getHeatMapData = async (req, res, next) => {
  try {
    const complaints = await Complaint.find(
      { 'location.coordinates.0': { $exists: true } },
      'complaintId title category status priority supportCount isEmergency location address'
    );

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    next(err);
  }
};

// Dashboard stats (admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [total, pending, resolved, emergency, inProgress] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ isEmergency: true, status: { $ne: 'Resolved' } }),
      Complaint.countDocuments({ status: 'In Progress' }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, pending, resolved, emergency, inProgress },
    });
  } catch (err) {
    next(err);
  }
};

// Overdue complaints (SLA breached)
exports.getOverdueComplaints = async (req, res, next) => {
  try {
    const now = new Date();
    const complaints = await Complaint.find({
      status: { $nin: ['Resolved'] },
      slaDeadline: { $lt: now, $ne: null },
    })
      .select('-supportedBy -__v')
      .sort({ slaDeadline: 1 })
      .limit(100);

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    next(err);
  }
};

// Get complaints by department (for dept staff)
exports.getComplaintsByDepartment = async (req, res, next) => {
  try {
    const { deptName } = req.params;
    const { status, page = 1, limit = 50 } = req.query;
    const filter = { department: deptName };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .select('-supportedBy -__v')
        .sort({ isEmergency: -1, effectivePriority: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: complaints,
    });
  } catch (err) {
    next(err);
  }
};
