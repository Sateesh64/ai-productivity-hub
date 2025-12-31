// frontend/src/App.js
import "./App.css";
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";

import Navbar from "./components/Navbar";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      setDarkMode(true);
    }
  }, []);

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      {/* Navbar stays here – Router is already in index.js */}
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
