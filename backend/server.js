const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Routes
const authRoutes = require("./Routes/authRoutes");
const complaintRoutes = require("./Routes/complaintRoutes");
const analyticsRoutes = require("./Routes/analyticsRoutes");
const voteRoutes = require("./Routes/voteRoutes");
const wasteRoutes = require("./Routes/wasteRoutes");
const citizenRoutes = require("./Routes/citizenRoutes");
const { ALL_CATEGORIES, DEPARTMENTS, STATUS_VALUES } = require("./config/constants");

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/citizens", citizenRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Smart City Complaint Management System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      complaints: "/api/complaints",
      analytics: "/api/analytics",
      votes: "/api/votes",
      waste: "/api/waste",
      citizens: "/api/citizens",
    },
  });
});

// Metadata endpoints (public)
app.get("/api/meta", (req, res) => {
  res.json({
    categories: ALL_CATEGORIES,
    departments: DEPARTMENTS,
    statuses: STATUS_VALUES,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ MongoDB Error:");
    console.log(err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
