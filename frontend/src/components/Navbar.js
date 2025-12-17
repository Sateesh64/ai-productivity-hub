// frontend/src/components/Navbar.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();

  // ✅ check login
  const isLoggedIn = !!localStorage.getItem("token");

  // ✅ logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        padding: "12px 20px",
        background: darkMode ? "#0f172a" : "#1f2937",
        color: "#fff",
        display: "flex",
        gap: "20px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* LEFT SIDE */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", fontSize: "18px" }}>
          AI Productivity Hub
        </span>

        <Link style={{ color: "#fff" }} to="/chat">
          Chat
        </Link>

        <Link style={{ color: "#fff" }} to="/tasks">
          Tasks
        </Link>

        {!isLoggedIn && (
          <>
            <Link style={{ color: "#fff" }} to="/login">
              Login
            </Link>

            <Link style={{ color: "#fff" }} to="/register">
              Register
            </Link>
          </>
        )}

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid #ef4444",
              color: "#ef4444",
              padding: "4px 10px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* RIGHT SIDE — DARK MODE TOGGLE */}
      <button
        onClick={onToggleDarkMode}
        style={{
          padding: "6px 14px",
          borderRadius: "999px",
          border: "1px solid #e5e7eb",
          background: darkMode ? "#e5e7eb" : "#0f172a",
          color: darkMode ? "#0f172a" : "#e5e7eb",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
      </button>
    </nav>
  );
};

export default Navbar;
