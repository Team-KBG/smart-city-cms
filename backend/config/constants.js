// Application-wide constants for categories, departments, and status values

const COMPLAINT_CATEGORIES = [
  "Road Damage",
  "Water Supply",
  "Electricity",
  "Garbage Collection",
  "Street Lights",
  "Public Safety",
  "Sewage",
  "Noise Pollution",
  "Air Pollution",
  "Illegal Construction",
  "Animal Menace",
  "Encroachment",
];

const EMERGENCY_CATEGORIES = ["Fire", "Gas Leakage", "Accident"];

const ALL_CATEGORIES = [...COMPLAINT_CATEGORIES, ...EMERGENCY_CATEGORIES];

const STATUS_VALUES = [
  "Pending",
  "Assigned",
  "In Progress",
  "Resolved",
  "Reopened",
];

const PRIORITY_LEVELS = ["Low", "Medium", "High", "Critical"];

const DEPARTMENTS = [
  "Water Department",
  "Electricity Department",
  "Sanitation Department",
  "Public Safety Department",
  "Roads & Infrastructure Department",
  "Environmental Department",
  "Urban Planning Department",
];

const CATEGORY_DEPARTMENT_MAP = {
  "Road Damage": "Roads & Infrastructure Department",
  "Water Supply": "Water Department",
  Electricity: "Electricity Department",
  "Garbage Collection": "Sanitation Department",
  "Street Lights": "Electricity Department",
  "Public Safety": "Public Safety Department",
  Sewage: "Water Department",
  "Noise Pollution": "Environmental Department",
  "Air Pollution": "Environmental Department",
  "Illegal Construction": "Urban Planning Department",
  "Animal Menace": "Public Safety Department",
  Encroachment: "Urban Planning Department",
  Fire: "Public Safety Department",
  "Gas Leakage": "Public Safety Department",
  Accident: "Public Safety Department",
};

const PUBLIC_VOTE_TYPES = [
  "New Park",
  "More Street Lights",
  "Speed Breakers",
];

const REPUTATION_LEVELS = {
  BRONZE: { name: "Bronze Citizen", minPoints: 0 },
  SILVER: { name: "Silver Citizen", minPoints: 100 },
  GOLD: { name: "Gold Citizen", minPoints: 250 },
};

const REPUTATION_POINTS = {
  COMPLAINT_SUBMITTED: 10,
  COMPLAINT_GENUINE: 25,
  ISSUE_RESOLVED_REPORT: 15,
  UPVOTE: 5,
};

module.exports = {
  COMPLAINT_CATEGORIES,
  EMERGENCY_CATEGORIES,
  ALL_CATEGORIES,
  STATUS_VALUES,
  PRIORITY_LEVELS,
  DEPARTMENTS,
  CATEGORY_DEPARTMENT_MAP,
  PUBLIC_VOTE_TYPES,
  REPUTATION_LEVELS,
  REPUTATION_POINTS,
};
