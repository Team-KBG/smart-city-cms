const Complaint = require("../Models/Complaint");
const { generateComplaintId } = require("../services/complaintIdService");
const { detectPriority, getEffectivePriority } = require("../services/priorityService");
const { suggestCategory } = require("../services/categorizationService");
const { findNearbyComplaints } = require("../services/geospatialService");
const {
  notifyComplaintRegistered,
  notifyStatusUpdated,
  notifyComplaintResolved,
} = require("../services/notificationService");
const {
  onComplaintSubmitted,
  onComplaintUpvote,
  onGenuineComplaint,
} = require("../services/reputationService");
const { EMERGENCY_CATEGORIES, CATEGORY_DEPARTMENT_MAP } = require("../config/constants");

// Check for nearby similar complaints before creating
exports.checkNearby = async (req, res) => {
  try {
    const { longitude, latitude, category } = req.query;

    if (!longitude || !latitude || !category) {
      return res.status(400).json({
        success: false,
        message: "longitude, latitude, and category are required",
      });
    }

    const nearby = await findNearbyComplaints(longitude, latitude, category);

    res.status(200).json({
      success: true,
      hasSimilar: nearby.length > 0,
      count: nearby.length,
      data: nearby,
      message:
        nearby.length > 0
          ? "Similar complaint already registered. Do you want to support it?"
          : "No similar complaints found nearby.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new complaint — uses req.user for citizen identity
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category: userCategory,
      address,
      longitude,
      latitude,
      supportExistingId,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    // Use authenticated user's identity
    const citizenEmail = req.user.email;
    const citizenName = req.user.name;
    const userId = req.user._id;

    // If citizen wants to support existing complaint instead of creating new one
    if (supportExistingId) {
      const existing = await Complaint.findById(supportExistingId);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Complaint to support not found" });
      }
      req.params.id = supportExistingId;
      return exports.upvoteComplaint(req, res);
    }

    const categorization = suggestCategory(title, description, userCategory);
    const priority = detectPriority(title, description, categorization.category);
    const isEmergency =
      EMERGENCY_CATEGORIES.includes(categorization.category) || categorization.isEmergency;

    const complaintData = {
      complaintId: generateComplaintId(),
      title: title.trim(),
      description: description.trim(),
      category: categorization.category,
      department: categorization.department || CATEGORY_DEPARTMENT_MAP[categorization.category],
      address: address ? address.trim() : "",
      priority,
      effectivePriority: priority,
      isEmergency,
      citizenEmail,
      citizenName,
      submittedBy: userId,
      autoCategorized: !userCategory,
      statusHistory: [{ status: "Pending", note: "Complaint registered" }],
    };

    if (longitude && latitude) {
      complaintData.location = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    if (req.file) {
      complaintData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create(complaintData);

    // Award reputation points using authenticated user's email
    await onComplaintSubmitted(citizenEmail, citizenName);

    await notifyComplaintRegistered(complaint);

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all complaints (admin sees all, citizens see their own + all in public view)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, emergency, mine } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (emergency === "true") filter.isEmergency = true;

    // Citizens can filter to only their own complaints
    if (mine === "true" && req.user.role !== "admin") {
      filter.submittedBy = req.user._id;
    }

    const complaints = await Complaint.find(filter)
      .populate("submittedBy", "name email")
      .sort({
        isEmergency: -1,   // Emergencies first
        supportCount: -1,  // More supported = higher priority
        createdAt: -1,     // Newest first
      });

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Track complaint by complaint ID (public)
exports.getComplaintByComplaintId = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId })
      .populate("submittedBy", "name email");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single complaint by MongoDB ID (public)
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("submittedBy", "name email");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update complaint (admin only)
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const oldStatus = complaint.status;
    const { status, department, priority, note } = req.body;

    if (department) complaint.department = department;
    if (priority) {
      complaint.priority = priority;
      complaint.effectivePriority = getEffectivePriority(priority, complaint.supportCount);
    }

    if (status && status !== oldStatus) {
      complaint.status = status;
      complaint.statusHistory.push({ status, note: note || `Status changed to ${status}` });

      if (status === "Assigned" && !complaint.assignedAt) {
        complaint.assignedAt = new Date();
      }
      if (status === "Resolved") {
        complaint.resolvedAt = new Date();
        if (complaint.citizenEmail) {
          await onGenuineComplaint(complaint.citizenEmail);
        }
        await notifyComplaintResolved(complaint);
      } else {
        await notifyStatusUpdated(complaint, oldStatus);
      }
    }

    await complaint.save();

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete complaint (admin only)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.status(200).json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upvote / support a complaint — uses req.user._id for deduplication
exports.upvoteComplaint = async (req, res) => {
  try {
    const userId = req.user._id;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Prevent user from supporting their own complaint
    if (complaint.submittedBy && complaint.submittedBy.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot support your own complaint",
      });
    }

    // Check if already supported using user ID (not email)
    const alreadySupported = complaint.supportedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadySupported) {
      return res.status(400).json({
        success: false,
        message: "You have already supported this complaint",
      });
    }

    complaint.supportCount += 1;
    complaint.supportedBy.push(userId);
    complaint.effectivePriority = getEffectivePriority(complaint.priority, complaint.supportCount);

    await complaint.save();

    // Award reputation to the supporter
    await onComplaintUpvote(req.user.email);

    res.status(200).json({
      success: true,
      message: "Complaint supported successfully",
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI categorization preview (public)
exports.previewCategorization = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: "title or description is required",
      });
    }

    const result = suggestCategory(title || "", description || "", null);
    const priority = detectPriority(title || "", description || "", result.category);

    res.status(200).json({
      success: true,
      data: { ...result, priority },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Heat map data (public)
exports.getHeatMapData = async (req, res) => {
  try {
    const complaints = await Complaint.find(
      { "location.coordinates.0": { $exists: true } },
      "complaintId title category status priority supportCount isEmergency location address"
    );

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard stats cards (public - used by admin dashboard)
exports.getDashboardStats = async (req, res) => {
  try {
    const [total, pending, resolved, emergency] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "Resolved" }),
      Complaint.countDocuments({ isEmergency: true, status: { $ne: "Resolved" } }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, pending, resolved, emergency },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
