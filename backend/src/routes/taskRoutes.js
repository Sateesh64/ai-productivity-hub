const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

/* --------------------------------------------------
   CREATE TASK
-------------------------------------------------- */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;

    const task = new Task({
      user: req.user.id, // ✅ REQUIRED FIX
      title,
      description,
      priority: priority || "medium",
      completed: completed ?? false,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------------------------------
   GET TASKS (USER-SPECIFIC)
-------------------------------------------------- */
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------------------------------
   UPDATE TASK
-------------------------------------------------- */
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------------------------------
   DELETE TASK
-------------------------------------------------- */
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;