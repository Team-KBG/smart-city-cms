const {
  COMPLAINT_CATEGORIES,
  EMERGENCY_CATEGORIES,
  CATEGORY_DEPARTMENT_MAP,
} = require("../config/constants");

// Keyword matching for automatic categorization - covers all categories
const CATEGORY_KEYWORDS = {
  // Emergency categories first (highest priority)
  "Gas Leakage": [
    "gas leak", "gas leakage", "gas smell", "smell of gas",
    "lpg", "lpg leak", "cylinder leak", "pipeline gas",
  ],
  Fire: [
    "fire", "smoke", "burning", "flame", "blaze", "inferno",
  ],
  Accident: [
    "accident", "collision", "crash", "hit and run", "road accident",
  ],

  // Standard categories
  "Road Damage": [
    "road", "pothole", "crack", "pavement", "asphalt",
    "broken road", "divider", "speed breaker", "road repair",
    "road damage", "paved", "unpaved", "road condition",
  ],
  "Water Supply": [
    "water", "water supply", "water shortage", "no water",
    "water cut", "water pipe", "pipe burst",
  ],
  Sewage: [
    "sewage", "drain", "drainage", "sewer", "manhole",
    "open manhole", "blocked drain", "overflow", "gutter",
  ],
  Electricity: [
    "electricity", "power", "power cut", "power outage",
    "transformer", "wire", "cable", "electric", "voltage",
    "short circuit", "tripping",
  ],
  "Garbage Collection": [
    "garbage", "waste", "trash", "dump", "dumping",
    "sanitation", "litter", "rubbish", "refuse",
  ],
  "Street Lights": [
    "street light", "streetlight", "lamp", "light pole",
    "lighting", "dark road", "light not working", "street lamp",
  ],
  "Noise Pollution": [
    "noise", "loud", "sound pollution", "loudspeaker",
    "noise complaint", "disturbance", "construction noise",
    "horn honking", "party noise",
  ],
  "Air Pollution": [
    "pollution", "air quality", "smog", "smoke pollution",
    "dust", "fumes", "emissions", "industrial smoke",
  ],
  "Illegal Construction": [
    "illegal construction", "unauthorized construction",
    "encroachment", "illegal building", "boundary wall",
    "construction violation", "noc violation",
  ],
  "Animal Menace": [
    "stray dog", "stray animal", "dog bite", "animal menace",
    "monkey", "cattle", "cow", "buffalo on road",
  ],
  Encroachment: [
    "encroachment", "footpath blocked", "pavement occupied",
    "hawker", "squatter", "illegal shop",
  ],
  "Public Safety": [
    "safety", "crime", "theft", "harassment",
    "security", "danger", "unsafe",
  ],
};

/**
 * Automatically categorize complaint using keyword matching
 */
function categorizeComplaint(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  // Emergency shortcut rules (highest priority)
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
    CATEGORY_DEPARTMENT_MAP[bestCategory] || "Public Safety Department";

  const isEmergency = EMERGENCY_CATEGORIES.includes(bestCategory);

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
    [...COMPLAINT_CATEGORIES, ...EMERGENCY_CATEGORIES].includes(userCategory)
  ) {
    return {
      category: userCategory,
      department: CATEGORY_DEPARTMENT_MAP[userCategory] || "Public Safety Department",
      isEmergency: EMERGENCY_CATEGORIES.includes(userCategory),
    };
  }

  return categorizeComplaint(title, description);
}

module.exports = {
  categorizeComplaint,
  suggestCategory,
};