const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const { apiLimiter } = require("./middleware/rateLimiter");

dotenv.config();

const app = express();

// Secure Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://unpkg.com", "https://raw.githubusercontent.com", "*"],
        connectSrc: ["'self'", "https://*.tile.openstreetmap.org", "*"],
      }
    }
  })
);

// Compression & Rate Limiting
app.use(compression());
app.use("/api", apiLimiter);

// CORS configuration with whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
const { sanitizeInput } = require("./middleware/sanitize");
app.use(sanitizeInput);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./Routes/authRoutes");
const complaintRoutes = require("./Routes/complaintRoutes");
const analyticsRoutes = require("./Routes/analyticsRoutes");
const voteRoutes = require("./Routes/voteRoutes");
const wasteRoutes = require("./Routes/wasteRoutes");
const citizenRoutes = require("./Routes/citizenRoutes");
const feedbackRoutes = require("./Routes/feedbackRoutes");
const errorHandler = require("./middleware/errorHandler");
const { ALL_CATEGORIES, DEPARTMENTS, STATUS_VALUES } = require("./config/constants");

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/feedback", feedbackRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Smart City Complaint Management System API",
    version: "1.0.0",
    endpoints: {
      complaints: "/api/complaints",
      analytics: "/api/analytics",
      votes: "/api/votes",
      waste: "/api/waste",
      citizens: "/api/citizens",
    },
  });
});

// Metadata endpoints
app.get("/api/meta", (req, res) => {
  res.json({
    categories: ALL_CATEGORIES,
    departments: DEPARTMENTS,
    statuses: STATUS_VALUES,
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    console.log("✅ MongoDB Connected");
    // Legacy DB migration: populate area and complaintId fields
    try {
      const Complaint = require("./Models/Complaint");
      const count = await Complaint.countDocuments({ 
        $or: [
          { area: { $exists: false } }, 
          { area: "Unknown" },
          { complaintId: { $exists: false } }
        ] 
      });
      if (count > 0) {
        console.log(`🔄 Migrating ${count} legacy complaints to add missing fields...`);
        const complaints = await Complaint.find({ 
          $or: [
            { area: { $exists: false } }, 
            { area: "Unknown" },
            { complaintId: { $exists: false } }
          ] 
        });
        const { generateComplaintId } = require("./services/complaintIdService");
        for (const c of complaints) {
          if (!c.complaintId) {
            c.complaintId = generateComplaintId();
          }
          if (!c.area || c.area === "Unknown") {
            const address = c.address || "";
            let extracted = "Unknown";
            const sectorMatch = address.match(/Sector\s*[-–—]?\s*([a-zA-Z0-9]+)/i);
            if (sectorMatch) {
              extracted = `Sector ${sectorMatch[1].toUpperCase()}`;
            } else {
              const parts = address.split(',');
              if (parts.length > 0) {
                const trimmed = parts[0].trim();
                if (trimmed && trimmed.length < 30) {
                  extracted = trimmed.replace(/\b\w/g, char => char.toUpperCase());
                }
              }
            }
            c.area = extracted;
          }
          await c.save();
        }
        console.log("✅ Legacy complaints migration complete!");
      }
    } catch (err) {
      console.error("❌ Migration error:", err.message);
    }

    // ── Citizens Migration ────────────────────────────────────────────────
    // Identify Citizens that have no password hash (legacy / seeded records).
    // We do NOT delete them, but log them clearly so operators know which
    // accounts need a password-reset before they can log in.
    try {
      const Citizen = require("./Models/Citizen");
      const legacyCitizens = await Citizen.find({
        $or: [
          { password: { $exists: false } },
          { password: null },
          { password: "" },
        ],
      }).select("email role createdAt");

      if (legacyCitizens.length > 0) {
        console.warn(
          `\u26a0\ufe0f  Found ${legacyCitizens.length} Citizen(s) with no password hash. ` +
          `These accounts cannot log in until a password is set.`
        );
        legacyCitizens.forEach((c) => {
          console.warn(
            `   \u2022 ${c.email} (role: ${c.role}, created: ${c.createdAt ? c.createdAt.toISOString() : "unknown"})`
          );
        });
        console.warn("   \u279c Use POST /api/auth/register with the same email to set a password, or contact a DB admin.");
      } else {
        console.log("✅ All Citizen records have a password hash — no legacy records found.");
      }
    } catch (err) {
      console.error("❌ Citizens migration/audit error:", err.message);
    }
    // ── Malformed Location Migration ──────────────────────────────────────
    // Complaints created before the schema fix may have location:{type:'Point'}
    // with no coordinates. The 2dsphere index rejects these and blocks all
    // future geospatial operations. Unset the location field to fix them.
    try {
      const db = mongoose.connection.db;
      const complaintsCol = db.collection('complaints');
      const malformedLocationResult = await complaintsCol.updateMany(
        { 'location.type': { $exists: true }, 'location.coordinates': { $exists: false } },
        { $unset: { location: '' } }
      );
      if (malformedLocationResult.modifiedCount > 0) {
        console.log(`✅ Fixed ${malformedLocationResult.modifiedCount} complaint(s) with malformed location field.`);
      }
    } catch (err) {
      console.error("❌ Malformed location migration error:", err.message);
    }
    // ─────────────────────────────────────────────────────────────────────
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:");
    console.log(err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
