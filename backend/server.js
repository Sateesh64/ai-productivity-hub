// backend/server.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express(); // << THIS WAS MISSING

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const taskRoutes = require("./src/routes/taskRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tasks", taskRoutes);



// Root route
app.get("/", (req, res) => {
  res.send("AI Productivity Hub Backend Running");
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) =>
    console.error("❌ DB connection error:", err.message)
  );

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
