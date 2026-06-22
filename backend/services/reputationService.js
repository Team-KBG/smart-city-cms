const Citizen = require("../Models/Citizen");
const { REPUTATION_LEVELS, REPUTATION_POINTS } = require("../config/constants");

function getLevelFromPoints(points) {
  if (points >= REPUTATION_LEVELS.GOLD.minPoints) return REPUTATION_LEVELS.GOLD.name;
  if (points >= REPUTATION_LEVELS.SILVER.minPoints) return REPUTATION_LEVELS.SILVER.name;
  return REPUTATION_LEVELS.BRONZE.name;
}

async function getOrCreateCitizen(email, name = "") {
  if (!email) return null;

  let citizen = await Citizen.findOne({ email });
  if (!citizen) {
    citizen = await Citizen.create({
      email,
      name,
      points: 0,
      level: REPUTATION_LEVELS.BRONZE.name,
    });
  } else if (name && !citizen.name) {
    citizen.name = name;
    await citizen.save();
  }
  return citizen;
}

async function awardPoints(email, points, reason, name = "") {
  const citizen = await getOrCreateCitizen(email, name);
  if (!citizen) return null;

  citizen.points += points;
  citizen.level = getLevelFromPoints(citizen.points);

  if (reason === "complaint_submitted") citizen.complaintsSubmitted += 1;
  if (reason === "upvote") citizen.upvotesGiven += 1;
  if (reason === "resolved_report") citizen.complaintsResolved += 1;

  await citizen.save();
  return citizen;
}

async function onComplaintSubmitted(email, name) {
  return awardPoints(email, REPUTATION_POINTS.COMPLAINT_SUBMITTED, "complaint_submitted", name);
}

async function onComplaintUpvote(email) {
  return awardPoints(email, REPUTATION_POINTS.UPVOTE, "upvote");
}

async function onComplaintResolved(email) {
  return awardPoints(email, REPUTATION_POINTS.ISSUE_RESOLVED_REPORT, "resolved_report");
}

async function onGenuineComplaint(email) {
  return awardPoints(email, REPUTATION_POINTS.COMPLAINT_GENUINE, "genuine");
}

module.exports = {
  getOrCreateCitizen,
  getLevelFromPoints,
  onComplaintSubmitted,
  onComplaintUpvote,
  onComplaintResolved,
  onGenuineComplaint,
};
