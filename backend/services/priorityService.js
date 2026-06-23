const { PRIORITY_LEVELS } = require("../config/constants");

const PRIORITY_RULES = [
  { keywords: ["gas leak", "gas leakage", "transformer blast", "transformer explosion", "transformer fire", "fire", "accident"], priority: "Critical" },
  { keywords: ["open manhole", "manhole open", "uncovered manhole", "public safety threat", "safety threat", "harassment", "crime", "threat"], priority: "High" },
  { keywords: ["water leakage", "water leak", "pipe burst", "water overflowing", "leakage", "broken streetlight", "street light", "streetlight", "street light not working", "streetlight broken", "light not working"], priority: "Medium" },
  { keywords: ["general maintenance", "maintenance", "cleaning", "pothole", "road damage", "garbage", "trash"], priority: "Low" },
];

/**
 * Detect priority from title and description using keyword matching
 */
function detectPriority(title = "", description = "", category = "") {
  const text = `${title} ${description} ${category}`.toLowerCase();

  for (const rule of PRIORITY_RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.priority;
    }
  }

  // Category-based defaults
  if (category === "Street Lights") return "Medium";
  if (["Fire", "Gas Leakage", "Accident", "Transformer Blast"].includes(category)) return "Critical";
  if (["Public Safety"].includes(category)) return "High";

  return "Low";
}

/**
 * Boost priority based on community support count
 */
function getEffectivePriority(basePriority, supportCount = 0) {
  const priorityIndex = PRIORITY_LEVELS.indexOf(basePriority);
  const boost = Math.floor(supportCount / 5);
  const newIndex = Math.min(priorityIndex + boost, PRIORITY_LEVELS.length - 1);
  return PRIORITY_LEVELS[newIndex];
}

module.exports = { detectPriority, getEffectivePriority };
