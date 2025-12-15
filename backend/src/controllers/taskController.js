// backend/src/controllers/taskController.js

const Task = require("../models/Task");

// GET /api/tasks - get all tasks for logged-in user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/tasks - create new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      userId: req.user.userId,
      title,
      description,
      priority: priority || "medium",
      dueDate: dueDate || null,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Create task error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/tasks/:id - update existing task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, priority, dueDate } = req.body;

    const updateData = {
      title,
      description,
      completed,
    };

    if (priority) {
      updateData.priority = priority;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate || null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updateData,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Update task error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/tasks/:id - delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
