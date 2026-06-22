const { PRIORITY_LEVELS } = require("../config/constants");

// Keyword-based priority detection rules
const PRIORITY_RULES = [
  { keywords: ["open manhole", "manhole open", "uncovered manhole"], priority: "Critical" },
  { keywords: ["transformer blast", "transformer explosion", "transformer fire"], priority: "High" },
  { keywords: ["water leakage", "water leak", "pipe burst", "water overflowing", "leakage"], priority: "Medium" },
  { keywords: ["broken streetlight", "street light", "streetlight", "street light not working", "streetlight broken", "light not working"], priority: "Medium" },
  { keywords: ["fire", "gas leak", "gas leakage", "accident", "emergency"], priority: "High" },
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
  if (["Fire", "Gas Leakage", "Accident"].includes(category)) return "High";

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
