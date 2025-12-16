import React, { useEffect, useState } from "react";
import API from "../api";

// 📌 Helper: Due date status (label + color + type)
const getDueStatus = (dueDate, completed) => {
  if (!dueDate) return null;

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (completed) {
    return {
      text: "Completed",
      color: "#16a34a", // green
      type: "completed",
    };
  }

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} days`,
      color: "#ef4444", // red
      type: "overdue",
    };
  }

  if (diffDays === 0) {
    return {
      text: "Due today",
      color: "#f97316", // orange
      type: "today",
    };
  }

  if (diffDays === 1) {
    return {
      text: "Due tomorrow",
      color: "#facc15", // yellow
      type: "tomorrow",
    };
  }

  if (diffDays <= 3) {
    return {
      text: `${diffDays} days left`,
      color: "#facc15", // yellow
      type: "soon",
    };
  }

  return {
    text: `${diffDays} days left`,
    color: "#22c55e", // green
    type: "future",
  };
};

const PAGE_SIZE = 5; // 🔢 tasks per page

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const [filter, setFilter] = useState("all"); // pending/completed filter
  const [search, setSearch] = useState(""); // 🔍 search text

  // 🔥 new quick filter: all | high | today | overdue
  const [quickFilter, setQuickFilter] = useState("all");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Edit state
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  // today string for min date
  const todayStr = new Date().toISOString().split("T")[0];

  // Load tasks
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // whenever filter/search/quickFilter changes, reset to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, quickFilter]);

  // Create form handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create Task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/tasks", form);
      setTasks((prev) => [res.data, ...prev]);

      setForm({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      setCurrentPage(1); // show new task on first page
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Complete
  const handleToggleComplete = async (task) => {
    try {
      const res = await API.put(`/tasks/${task._id}`, {
        ...task,
        completed: !task.completed,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Edit popup open
  const startEditing = (task) => {
    setEditTask(task);

    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
  };

  // Edit form change
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Save edited task
  const saveEdit = async () => {
    try {
      const res = await API.put(`/tasks/${editTask._id}`, {
        ...editTask,
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        dueDate: editForm.dueDate || null,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === editTask._id ? res.data : t))
      );

      setEditTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 📊 Summary counts (based on all tasks)
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const now = new Date();
  const overdueCount = tasks.filter(
    (t) =>
      !t.completed &&
      t.dueDate &&
      new Date(t.dueDate) < now
  ).length;

  // for quick filter date comparisons
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  // Filter + Search + Sort tasks
  const filteredTasks = [...tasks]
    // main status filter (all / pending / completed)
    .filter((task) => {
      if (filter === "pending") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    })
    // search
    .filter((task) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const title = task.title?.toLowerCase() || "";
      const desc = task.description?.toLowerCase() || "";
      return title.includes(q) || desc.includes(q);
    })
    // 🔥 quick filters
    .filter((task) => {
      if (quickFilter === "all") return true;

      if (quickFilter === "high") {
        return task.priority === "high";
      }

      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      const dueStart = new Date(
        due.getFullYear(),
        due.getMonth(),
        due.getDate(),
        0,
        0,
        0,
        0
      );

      if (quickFilter === "today") {
        return !task.completed && dueStart.getTime() === todayStart.getTime();
      }

      if (quickFilter === "overdue") {
        return !task.completed && dueStart < todayStart;
      }

      return true;
    })
    // sort by due date
    .sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate) : null;
      const bDate = b.dueDate ? new Date(b.dueDate) : null;

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return aDate - bDate;
    });

  // 🔢 Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedTasks = filteredTasks.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="tasks-container">
      <h2 className="tasks-title">My Tasks</h2>

      {/* 📊 Summary bar */}
      {totalTasks > 0 && (
        <div className="tasks-summary">
          <div className="tasks-summary-item">
            <span className="tasks-summary-label">Total</span>
            <span className="tasks-summary-value">{totalTasks}</span>
          </div>
          <div className="tasks-summary-item">
            <span className="tasks-summary-label">Pending</span>
            <span className="tasks-summary-value">{pendingCount}</span>
          </div>
          <div className="tasks-summary-item">
            <span className="tasks-summary-label">Completed</span>
            <span className="tasks-summary-value">{completedCount}</span>
          </div>
          <div className="tasks-summary-item">
            <span className="tasks-summary-label">Overdue</span>
            <span className="tasks-summary-value">{overdueCount}</span>
          </div>
          <div className="tasks-summary-item">
            <span className="tasks-summary-label">Showing</span>
            <span className="tasks-summary-value">
              {paginatedTasks.length} / {filteredTasks.length}
            </span>
          </div>
        </div>
      )}

      {/* 🔍 Search + Filter Row */}
      <div
        style={{
          margin: "0 auto 10px",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end", // bottom-align search + buttons
          gap: "12px",
          flexWrap: "nowrap",
        }}
      >
        {/* Search bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tasks-input"
            style={{ width: "100%" }}
          />
        </div>

        {/* Filter Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <button
            className={`tasks-btn-primary ${
              filter === "all" ? "" : "outline"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`tasks-btn-primary ${
              filter === "pending" ? "" : "outline"
            }`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`tasks-btn-primary ${
              filter === "completed" ? "" : "outline"
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {/* 🔥 Quick filter chips */}
      <div className="tasks-quick-filters">
        <button
          className={`tasks-chip ${
            quickFilter === "all" ? "active" : ""
          }`}
          onClick={() => setQuickFilter("all")}
        >
          All tasks
        </button>
        <button
          className={`tasks-chip ${
            quickFilter === "high" ? "active" : ""
          }`}
          onClick={() => setQuickFilter("high")}
        >
          High priority
        </button>
        <button
          className={`tasks-chip ${
            quickFilter === "today" ? "active" : ""
          }`}
          onClick={() => setQuickFilter("today")}
        >
          Due today
        </button>
        <button
          className={`tasks-chip ${
            quickFilter === "overdue" ? "active" : ""
          }`}
          onClick={() => setQuickFilter("overdue")}
        >
          Overdue
        </button>
      </div>

      {/* Create Task */}
      <form className="tasks-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          className="tasks-input"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          className="tasks-textarea"
          rows="3"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <label>Priority</label>
        <select
          className="tasks-input"
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label>Due Date</label>
        <input
          type="date"
          className="tasks-input"
          name="dueDate"
          value={form.dueDate}
          min={todayStr}
          onChange={handleChange}
        />

        <button className="tasks-btn-primary" type="submit">
          Add Task
        </button>
      </form>

      {/* Task List */}
      <ul className="tasks-list">
        {paginatedTasks.map((task) => {
          const isOverdue =
            task.dueDate &&
            !task.completed &&
            new Date(task.dueDate) < new Date();

          const status = getDueStatus(task.dueDate, task.completed);

          // 🎨 Card background based on status
          let cardBg = "#ffffff";
          if (status?.type === "overdue") cardBg = "#fef2f2"; // light red
          else if (
            status?.type === "today" ||
            status?.type === "tomorrow" ||
            status?.type === "soon"
          )
            cardBg = "#fffbeb"; // light yellow
          else if (status?.type === "completed") cardBg = "#ecfdf3"; // light green

          return (
            <li
              key={task._id}
              className="task-item"
              style={{
                background: cardBg,
                transition: "background 0.2s ease",
              }}
            >
              <div className="task-main">
                <span
                  className={`task-badge ${
                    task.completed ? "completed" : "pending"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>

                <span className={`task-priority ${task.priority}`}>
                  {task.priority} priority
                </span>

                {isOverdue && !task.completed && (
                  <span className="task-overdue">Overdue</span>
                )}

                <div
                  className={`task-title ${
                    task.completed ? "completed" : ""
                  }`}
                >
                  {task.title}
                </div>

                {task.description && (
                  <p className="task-desc">{task.description}</p>
                )}

                <div className="task-meta">
                  Created:{" "}
                  {new Date(task.createdAt).toLocaleString()}{" "}
                  {task.dueDate && (
                    <>
                      {" | "}Due:{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </>
                  )}
                </div>

                {/* Colored due-date status badge */}
                {status && (
                  <div className="task-days-left">
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: status.color,
                        color: "#ffffff",
                      }}
                    >
                      {status.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="task-actions">
                <button
                  className="btn-small btn-toggle"
                  onClick={() => handleToggleComplete(task)}
                >
                  {task.completed ? "Undo" : "Done"}
                </button>

                <button
                  className="btn-small btn-edit"
                  onClick={() => startEditing(task)}
                >
                  Edit
                </button>

                <button
                  className="btn-small btn-delete"
                  onClick={() => handleDelete(task._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Empty */}
      {filteredTasks.length === 0 && (
        <p className="tasks-empty">No tasks yet. Add one ✏️</p>
      )}

      {/* 🔢 Pagination controls */}
      {filteredTasks.length > 0 && totalPages > 1 && (
        <div className="tasks-pagination">
          <button
            className="page-btn"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${page === safePage ? "active" : ""}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* ⭐ FULL EDIT POPUP */}
      {editTask && (
        <div className="edit-overlay">
          <div className="edit-box">
            <h3>Edit Task</h3>

            <label>Title</label>
            <input
              name="title"
              className="tasks-input"
              value={editForm.title}
              onChange={handleEditChange}
            />

            <label>Description</label>
            <textarea
              name="description"
              className="tasks-textarea"
              rows="3"
              value={editForm.description}
              onChange={handleEditChange}
            />

            <label>Priority</label>
            <select
              name="priority"
              className="tasks-input"
              value={editForm.priority}
              onChange={handleEditChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              className="tasks-input"
              value={editForm.dueDate}
              min={todayStr}
              onChange={handleEditChange}
            />

            <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
              <button className="tasks-btn-primary" onClick={saveEdit}>
                Save
              </button>
              <button
                className="tasks-btn-primary outline"
                onClick={() => setEditTask(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;