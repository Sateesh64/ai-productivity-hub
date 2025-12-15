// backend/src/routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const Task = require("../models/Task"); // <-- uses Task.js we just updated

// ------------------------------------------------------------------
// CREATE TASK  (POST /api/tasks)
// ------------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;

    const task = new Task({
      title,
      description,
      priority: priority || "medium",
      completed: completed ?? false,
      // store dueDate if provided (string "YYYY-MM-DD" from <input type="date" />)
      dueDate: dueDate ? new Date(dueDate) : null,
      // if you have user auth, you can also set: user: req.userId
    });

    await task.save();
    return res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    return res
      .status(500)
      .json({ error: "Error creating task", details: err.message });
  }
});

// ------------------------------------------------------------------
// GET ALL TASKS  (GET /api/tasks)
// ------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    // if you have per-user tasks, filter with { user: req.userId }
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return res
      .status(500)
      .json({ error: "Error loading tasks", details: err.message });
  }
});

// ------------------------------------------------------------------
// UPDATE TASK  (PUT /api/tasks/:id)
// ------------------------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const { title, description, priority, completed, dueDate } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        priority,
        completed,
        // update dueDate (allow clearing by sending null / empty string)
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("Error updating task:", err);
    return res
      .status(500)
      .json({ error: "Error updating task", details: err.message });
  }
});

// ------------------------------------------------------------------
// DELETE TASK  (DELETE /api/tasks/:id)
// ------------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    return res
      .status(500)
      .json({ error: "Error deleting task", details: err.message });
  }
});

module.exports = router;
