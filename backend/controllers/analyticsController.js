const Complaint = require('../Models/Complaint');
const Feedback = require('../Models/Feedback');
const { DEPARTMENTS } = require('../config/constants');
const logger = require('../utils/logger');

exports.getAnalytics = async (req, res, next) => {
  try {
    const result = await Complaint.aggregate([
      {
        $facet: {
          statusDistribution: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          categoryDistribution: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          monthlyTrend: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
          ],
          avgResolutionTime: [
            { $match: { resolvedAt: { $ne: null }, createdAt: { $ne: null } } },
            {
              $group: {
                _id: null,
                avgMs: {
                  $avg: { $subtract: ['$resolvedAt', '$createdAt'] },
                },
              },
            },
          ],
          mostComplainedAreas: [
            { $match: { area: { $ne: 'Unknown', $exists: true } } },
            { $group: { _id: '$area', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          departmentStats: [
            { $match: { department: { $ne: null, $exists: true } } },
            {
              $group: {
                _id: '$department',
                assigned: {
                  $sum: {
                    $cond: [{ $in: ['$status', ['Assigned', 'In Progress', 'Resolved', 'Reopened']] }, 1, 0],
                  },
                },
                resolved: {
                  $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
                },
              },
            },
          ],
          totalComplaints: [
            { $count: 'count' },
          ],
          emergencyStats: [
            { $match: { isEmergency: true } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          priorityDistribution: [
            { $group: { _id: '$effectivePriority', count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    const data = result[0];

    // Format status distribution as { Status: count }
    const statusDistribution = {};
    data.statusDistribution.forEach((s) => { statusDistribution[s._id] = s.count; });

    // Format category distribution
    const categoryDistribution = {};
    data.categoryDistribution.forEach((c) => { categoryDistribution[c._id] = c.count; });

    // Format monthly trend as array of { name, count }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = data.monthlyTrend.map((m) => ({
      name: `${months[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
    }));

        // Avg resolution time in hours/days
    const avgMs = data.avgResolutionTime[0]?.avgMs || 0;
    const avgResolutionHours = Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10;
    const avgResolutionDays = Math.round((avgMs / (1000 * 60 * 60 * 24)) * 10) / 10;

    // Most complained area
    const mostComplainedArea = data.mostComplainedAreas[0]
      ? { area: data.mostComplainedAreas[0]._id, count: data.mostComplainedAreas[0].count }
      : { area: "Sector 62", count: 0 };

    // Most common issue
    const topCategory = data.categoryDistribution[0];
    const mostCommonIssue = topCategory
      ? { category: topCategory._id, count: topCategory.count }
      : null;

    // Department performance
    const deptMap = {};
    data.departmentStats.forEach((d) => { deptMap[d._id] = d; });
    const departmentPerformance = DEPARTMENTS.map((dept) => {
      const d = deptMap[dept] || { assigned: 0, resolved: 0 };
      const score = d.assigned > 0 ? Math.round((d.resolved / d.assigned) * 100) : 0;
      return { department: dept, assigned: d.assigned, resolved: d.resolved, score };
    }).sort((a, b) => b.score - a.score);

    // Emergency stats
    const emergencyByStatus = {};
    data.emergencyStats.forEach((e) => { emergencyByStatus[e._id] = e.count; });

    // Priority distribution
    const priorityDistribution = {};
    data.priorityDistribution.forEach((p) => { priorityDistribution[p._id] = p.count; });

    res.status(200).json({
      success: true,
      data: {
        totalComplaints: data.totalComplaints[0]?.count || 0,
        mostComplainedArea,
        mostCommonIssue,
        avgResolutionHours,
        avgResolutionDays,
        statusDistribution,
        categoryDistribution,
        monthlyTrend,
        departmentPerformance,
        emergencyByStatus,
        priorityDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentRanking = async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { department: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$department',
          totalAssigned: {
            $sum: { $cond: [{ $in: ['$status', ['Assigned', 'In Progress', 'Resolved', 'Reopened']] }, 1, 0] },
          },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          avgResolutionMs: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$resolvedAt', null] }, { $ne: ['$createdAt', null] }] },
                { $subtract: ['$resolvedAt', '$createdAt'] },
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          department: '$_id',
          _id: 0,
          totalAssigned: 1,
          resolved: 1,
          performanceScore: {
            $cond: [
              { $gt: ['$totalAssigned', 0] },
              { $round: [{ $multiply: [{ $divide: ['$resolved', '$totalAssigned'] }, 100] }, 0] },
              0,
            ],
          },
          avgResolutionHours: {
            $cond: [
              { $ne: ['$avgResolutionMs', null] },
              { $round: [{ $divide: ['$avgResolutionMs', 3600000] }, 1] },
              null,
            ],
          },
        },
      },
      { $sort: { performanceScore: -1 } },
    ];

    const ranking = await Complaint.aggregate(pipeline);

    // Fill in any departments with zero activity
    const rankedDepts = new Set(ranking.map((r) => r.department));
    DEPARTMENTS.forEach((dept) => {
      if (!rankedDepts.has(dept)) {
        ranking.push({ department: dept, totalAssigned: 0, resolved: 0, performanceScore: 0, avgResolutionHours: null });
      }
    });

    res.status(200).json({ success: true, data: ranking });
  } catch (err) {
    next(err);
  }
};
