const Complaint = require("../Models/Complaint");
const { DEPARTMENTS } = require("../config/constants");

exports.getAnalytics = async (req, res) => {
  try {
    const complaints = await Complaint.find().lean();

    // Most complained area (by address)
    const areaCounts = {};
    complaints.forEach((c) => {
      if (!c.address || c.address.trim() === "") return;
      let area = c.address.trim();
      if (area.includes(",")) area = area.split(",")[0].trim();
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });
    const mostComplainedArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0];

    // Category counts
    const categoryCounts = {};
    complaints.forEach((c) => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });
    const mostCommonIssue = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    // Average resolution time (in hours)
    const resolved = complaints.filter((c) => c.resolvedAt && c.createdAt);
    let avgResolutionHours = 0;
    if (resolved.length > 0) {
      const totalHours = resolved.reduce((sum, c) => {
        const diff = (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60);
        return sum + diff;
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolved.length) * 10) / 10;
    }

    // Status distribution
    const statusDistribution = {};
    complaints.forEach((c) => {
      statusDistribution[c.status] = (statusDistribution[c.status] || 0) + 1;
    });

    // Category distribution
    const categoryDistribution = categoryCounts;

    // Monthly trend (last 12 months)
    const monthlyTrend = {};
    complaints.forEach((c) => {
      const month = new Date(c.createdAt).toLocaleString("en-US", { month: "short", year: "2-digit" });
      monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
    });

    // Emergency stats
    const emergencyCount = complaints.filter((c) => c.isEmergency).length;
    const resolvedEmergencyCount = complaints.filter((c) => c.isEmergency && c.status === "Resolved").length;

    // Priority distribution
    const priorityDistribution = {};
    complaints.forEach((c) => {
      const priority = c.effectivePriority || c.priority || "Low";
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
    });

    // Department performance
    const departmentStats = {};
    DEPARTMENTS.forEach((dept) => {
      departmentStats[dept] = { assigned: 0, resolved: 0, pending: 0, score: 0 };
    });

    complaints.forEach((c) => {
      if (c.department && departmentStats[c.department]) {
        if (["Assigned", "In Progress", "Resolved", "Reopened"].includes(c.status)) {
          departmentStats[c.department].assigned += 1;
        }
        if (c.status === "Pending") {
          departmentStats[c.department].pending += 1;
        }
        if (c.status === "Resolved") {
          departmentStats[c.department].resolved += 1;
        }
      }
    });

    const departmentPerformance = DEPARTMENTS.map((dept) => {
      const stats = departmentStats[dept];
      const score = stats.assigned > 0 ? Math.round((stats.resolved / stats.assigned) * 100) : 0;
      return { department: dept, ...stats, score };
    })
      .filter((d) => d.assigned > 0 || d.pending > 0)
      .sort((a, b) => b.score - a.score);

    // Top supported complaints
    const topSupported = complaints
      .filter((c) => c.supportCount > 0)
      .sort((a, b) => b.supportCount - a.supportCount)
      .slice(0, 5)
      .map((c) => ({
        id: c.complaintId,
        title: c.title,
        category: c.category,
        supportCount: c.supportCount,
        status: c.status,
      }));

    res.status(200).json({
      success: true,
      data: {
        totalComplaints: complaints.length,
        resolvedCount: statusDistribution["Resolved"] || 0,
        pendingCount: statusDistribution["Pending"] || 0,
        emergencyCount,
        resolvedEmergencyCount,
        mostComplainedArea: mostComplainedArea
          ? { area: mostComplainedArea[0], count: mostComplainedArea[1] }
          : null,
        mostCommonIssue: mostCommonIssue
          ? { category: mostCommonIssue[0], count: mostCommonIssue[1] }
          : null,
        avgResolutionHours,
        statusDistribution,
        categoryDistribution,
        priorityDistribution,
        monthlyTrend,
        departmentPerformance,
        topSupported,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDepartmentRanking = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      department: { $exists: true, $ne: null },
    }).lean();

    const stats = {};
    DEPARTMENTS.forEach((dept) => {
      stats[dept] = { totalAssigned: 0, resolved: 0, pending: 0 };
    });

    complaints.forEach((c) => {
      if (stats[c.department]) {
        if (["Assigned", "In Progress", "Resolved", "Reopened"].includes(c.status)) {
          stats[c.department].totalAssigned += 1;
        }
        if (c.status === "Pending") {
          stats[c.department].pending += 1;
        }
        if (c.status === "Resolved") {
          stats[c.department].resolved += 1;
        }
      }
    });

    const ranking = DEPARTMENTS.map((dept) => ({
      department: dept,
      totalAssigned: stats[dept].totalAssigned,
      resolved: stats[dept].resolved,
      pending: stats[dept].pending,
      performanceScore:
        stats[dept].totalAssigned > 0
          ? Math.round((stats[dept].resolved / stats[dept].totalAssigned) * 100)
          : 0,
    })).sort((a, b) => b.performanceScore - a.performanceScore);

    res.status(200).json({ success: true, data: ranking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
