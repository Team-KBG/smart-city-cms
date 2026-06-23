const {
  COMPLAINT_CATEGORIES,
  EMERGENCY_CATEGORIES,
  CATEGORY_DEPARTMENT_MAP,
} = require("../config/constants");

// AI-style keyword matching for automatic categorization
const CATEGORY_KEYWORDS = {
  "Gas Leakage": [
    "gas leak",
    "gas leakage",
    "gas",
    "lpg",
    "cylinder leak",
    "pipeline gas",
    "gas smell",
    "smell of gas",
  ],

  Fire: [
    "fire",
    "smoke",
    "burning",
    "flame",
  ],

  Accident: [
    "accident",
    "collision",
    "crash",
    "hit and run",
  ],

  "Road Damage": [
    "road",
    "pothole",
    "crack",
    "pavement",
    "asphalt",
    "broken road",
  ],

  "Water Supply": [
    "water",
    "water leak",
    "water leakage",
    "pipe burst",
    "water pipe",
    "supply",
    "drainage",
    "sewage",
  ],

  Electricity: [
    "electricity",
    "power",
    "transformer",
    "wire",
    "cable",
    "outage",
  ],

  "Garbage Collection": [
    "garbage",
    "waste",
    "trash",
    "dump",
    "sanitation",
    "litter",
  ],

  "Street Lights": [
    "street light",
    "streetlight",
    "lamp",
    "light pole",
    "lighting",
  ],

  "Public Safety": [
    "safety",
    "crime",
    "theft",
    "harassment",
    "security",
  ],
};

/**
 * Automatically categorize complaint using keyword matching
 */
function categorizeComplaint(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  // Emergency shortcut rules
  if (
    text.includes("gas leak") ||
    text.includes("gas leakage") ||
    text.includes("smell of gas") ||
    text.includes("lpg leak")
  ) {
    return {
      category: "Gas Leakage",
      department: CATEGORY_DEPARTMENT_MAP["Gas Leakage"],
      isEmergency: true,
      confidence: 100,
    };
  }

  if (
    text.includes("transformer blast") ||
    text.includes("transformer explosion")
  ) {
    return {
      category: "Electricity",
      department: CATEGORY_DEPARTMENT_MAP["Electricity"],
      isEmergency: true,
      confidence: 100,
    };
  }

  let bestCategory = "Public Safety";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce(
      (total, keyword) =>
        total + (text.includes(keyword.toLowerCase()) ? 1 : 0),
      0
    );

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const department =
    CATEGORY_DEPARTMENT_MAP[bestCategory] ||
    "Public Safety Department";

  const isEmergency =
    EMERGENCY_CATEGORIES.includes(bestCategory);

  return {
    category: bestCategory,
    department,
    isEmergency,
    confidence: bestScore,
  };
}

/**
 * Suggest category if user didn't provide one
 */
function suggestCategory(title, description, userCategory) {
  if (
    userCategory &&
    [...COMPLAINT_CATEGORIES, ...EMERGENCY_CATEGORIES].includes(
      userCategory
    )
  ) {
    return {
      category: userCategory,
      department: CATEGORY_DEPARTMENT_MAP[userCategory],
      isEmergency: EMERGENCY_CATEGORIES.includes(userCategory),
    };
  }

  return categorizeComplaint(title, description);
}

module.exports = {
  categorizeComplaint,
  suggestCategory,
};