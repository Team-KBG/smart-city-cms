/**
 * Generate unique complaint ID: CMP-YYYYMMDD-XXXX
 */
function generateComplaintId() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${dateStr}-${random}`;
}

module.exports = { generateComplaintId };
