const Task = require("../models/Task");

// GET /api/tasks - get all tasks for logged-in user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
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
      title: title.trim(),
      description,
      priority: priority || "medium",
      dueDate: dueDate || null,
      user: req.user.id, // ✅ correct user binding
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
      priority,
      dueDate: dueDate || null,
    };

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id }, // ✅ user-safe update
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
      user: req.user.id, // ✅ user-safe delete
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

