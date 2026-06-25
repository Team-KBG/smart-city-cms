export const COMPLAINT_CATEGORIES = [
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
  "Roads & Infrastructure Department",
  "Environmental Department",
  "Urban Planning Department",
];

export const PUBLIC_VOTE_TYPES = [
  "New Park",
  "More Street Lights",
  "Speed Breakers",
  "Road Repair",
  "Public Toilet",
  "Garbage Bin Installation",
  "Tree Plantation",
  "CCTV Camera",
  "Bus Shelter",
  "Other",
];

// Status color values for inline CSS usage
export const STATUS_COLORS_CSS = {
  Pending: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
  Assigned: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  "In Progress": { bg: "#ede9fe", color: "#5b21b6", border: "#c4b5fd" },
  Resolved: { bg: "#dcfce7", color: "#14532d", border: "#86efac" },
  Reopened: { bg: "#ffedd5", color: "#9a3412", border: "#fed7aa" },
};

// Priority color values for inline CSS usage
export const PRIORITY_COLORS_CSS = {
  Low: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
  Medium: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
  High: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  Critical: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
};

export const LEVEL_CONFIG = {
  "Bronze Citizen": { bg: "#fef3c7", color: "#92400e", icon: "🥉" },
  "Silver Citizen": { bg: "#f1f5f9", color: "#475569", icon: "🥈" },
  "Gold Citizen": { bg: "#fef9c3", color: "#713f12", icon: "🥇" },
};
