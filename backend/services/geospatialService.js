const Complaint = require("../Models/Complaint");

/**
 * Find similar complaints within 100 meters using MongoDB geospatial query
 */
async function findNearbyComplaints(longitude, latitude, category, maxDistanceMeters = 100) {
  if (longitude == null || latitude == null) {
    return [];
  }

  const nearby = await Complaint.find({
    category,
    status: { $nin: ["Resolved"] },
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  }).limit(5);

  return nearby;
}

/**
 * Get complaints for heat map display
 */
async function getComplaintsForHeatMap() {
  return Complaint.find(
    { "location.coordinates.0": { $exists: true } },
    "complaintId title category status priority supportCount isEmergency location address"
  );
}

module.exports = { findNearbyComplaints, getComplaintsForHeatMap };
