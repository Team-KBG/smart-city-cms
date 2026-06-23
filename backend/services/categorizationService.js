const {
  COMPLAINT_CATEGORIES,
  EMERGENCY_CATEGORIES,
  CATEGORY_DEPARTMENT_MAP,
} = require("../config/constants");

// AI-style keyword matching for automatic categorization
const CATEGORY_KEYWORDS = {
  "Road Damage": ["road", "pothole", "crack", " pavement", " asphalt", " broken road"],
  "Water Supply": ["water", "pipe", "leakage", "leak", "supply", "drainage", "sewage"],
  Electricity: ["electricity", "power", "transformer", "wire", "cable", " outage"],
  "Garbage Collection": ["garbage", "waste", "trash", "dump", "sanitation", " litter"],
  "Street Lights": ["street light", "streetlight", "lamp", "light pole", " lighting"],
  "Public Safety": ["safety", "crime", "theft", "harassment", "security"],
  Fire: ["fire", "smoke", "burning", "flame"],
  "Gas Leakage": ["gas leak", "gas leakage", "lpg", "cylinder leak"],
  Accident: ["accident", "collision", "crash", "hit and run"],
  "Transformer Blast": ["transformer blast", "transformer explosion", "transformer fire"],
};

/**
 * Automatically categorize complaint using keyword matching
 */
function categorizeComplaint(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  let bestCategory = "Public Safety";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce(
      (total, keyword) => total + (text.includes(keyword.trim()) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const department = CATEGORY_DEPARTMENT_MAP[bestCategory] || "Public Safety Department";
  const isEmergency = EMERGENCY_CATEGORIES.includes(bestCategory);

  return { category: bestCategory, department, isEmergency, confidence: bestScore };
}

/**
 * Suggest category if user didn't provide one
 */
function suggestCategory(title, description, userCategory) {
  if (userCategory && [...COMPLAINT_CATEGORIES, ...EMERGENCY_CATEGORIES].includes(userCategory)) {
    return {
      category: userCategory,
      department: CATEGORY_DEPARTMENT_MAP[userCategory],
      isEmergency: EMERGENCY_CATEGORIES.includes(userCategory),
    };
  }
  return categorizeComplaint(title, description);
}

module.exports = { categorizeComplaint, suggestCategory };
