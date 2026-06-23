export const COMPLAINT_CATEGORIES = [
  "Road Damage",
  "Water Supply",
  "Electricity",
  "Garbage Collection",
  "Street Lights",
  "Public Safety",
];

export const EMERGENCY_CATEGORIES = ["Fire", "Gas Leakage", "Accident"];

export const ALL_CATEGORIES = [...COMPLAINT_CATEGORIES, ...EMERGENCY_CATEGORIES];

export const STATUS_VALUES = [
  "Pending",
  "Assigned",
  "In Progress",
  "Resolved",
  "Reopened",
];

export const DEPARTMENTS = [
  "Water Department",
  "Electricity Department",
  "Sanitation Department",
  "Public Safety Department",
];

export const PUBLIC_VOTE_TYPES = [
  "New Park",
  "More Street Lights",
  "Speed Breakers",
];

export const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  Assigned: "bg-blue-100 text-blue-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  Resolved: "bg-green-100 text-green-800",
  Reopened: "bg-orange-100 text-orange-800",
};

export const PRIORITY_COLORS = {
  Low: "bg-gray-100 text-gray-700",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800",
};

export const LEVEL_COLORS = {
  "Bronze Citizen": "text-amber-700 bg-amber-50",
  "Silver Citizen": "text-slate-600 bg-slate-100",
  "Gold Citizen": "text-yellow-700 bg-yellow-50",
  "Platinum Citizen": "text-purple-700 bg-purple-50",
};
