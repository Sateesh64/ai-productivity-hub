// backend/src/models/Task.js  (or backend/models/task.js)
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    completed: {
      type: Boolean,
      default: false,
    },

    // ⭐ NEW FIELD: Due Date
    dueDate: {
      type: Date,
      required: false, // optional; remove this line if you want it mandatory
    },

    // If your old model already had a user field, keep it like this:
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Task", taskSchema);
