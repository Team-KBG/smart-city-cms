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
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const complaintRoutes = require("./Routes/complaintRoutes");
const analyticsRoutes = require("./Routes/analyticsRoutes");
const voteRoutes = require("./Routes/voteRoutes");
const wasteRoutes = require("./Routes/wasteRoutes");
const citizenRoutes = require("./Routes/citizenRoutes");
const { ALL_CATEGORIES, DEPARTMENTS, STATUS_VALUES } = require("./config/constants");

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
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ MongoDB Error:");
    console.log(err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
