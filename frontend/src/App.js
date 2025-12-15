// frontend/src/App.js
import "./App.css";

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";

import Navbar from "./components/Navbar"; // only one import

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved mode from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      setDarkMode(true);
    }
  }, []);

  // Save whenever darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <Router>
        {/* Pass dark mode info to Navbar so it can show the toggle button */}
        <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        <main className="app-main">
          <Routes>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<ChatPage />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;

