import React, { useState, useRef, useEffect } from "react";
import API from "../api";

const ChatPage = () => {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // {id, sender, text}
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleAsk = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    // add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await API.post("/ai/chat", { prompt: trimmed });
      const aiText =
        res?.data?.reply || "Something went wrong. Please try again.";

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiText,
      };

      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const aiMsg = {
        id: Date.now() + 2,
        sender: "ai",
        text: "Error talking to AI.",
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearInput = () => {
    setPrompt("");
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  const initRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const handleToggleListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = recognitionRef.current || initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return (
    <div
      className="page page-chat"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <div
        className="chat-box"
        style={{
          width: "100%",
          maxWidth: "750px",
          marginTop: "50px",
          background: "var(--card-bg, #ffffff)",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        <h2
          className="page-title"
          style={{ textAlign: "center", marginBottom: "24px" }}
        >
          Chat
        </h2>

        {/* Prompt */}
        <label style={{ fontWeight: 600 }}>Prompt</label>
        <textarea
          rows="4"
          className="input chat-textarea"
          placeholder="Ask anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            marginBottom: "12px",
            border: "1px solid var(--border-color, #ccc)",
            borderRadius: "8px",
            resize: "vertical",
            background: "var(--input-bg, #ffffff)",
            color: "var(--text-color, #111827)",
          }}
        />

        {/* Buttons row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearInput}
            >
              Clear Input
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearChat}
            >
              Clear Chat
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleToggleListening}
              title="Voice input"
            >
              {isListening ? "🎙 Stop" : "🎤 Speak"}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAsk}
              disabled={loading}
            >
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>
        </div>

        {/* Reply / history */}
        <div style={{ marginTop: "24px" }}>
          <strong style={{ fontSize: "1.05rem" }}>Reply:</strong>

          <div
            className="chat-history-container"
            style={{
              marginTop: "10px",
              padding: "12px",
              background: "var(--chat-bg, #f3f4f6)",
              borderRadius: "10px",
              maxHeight: "380px",
              overflowY: "auto",
            }}
          >
            {chatHistory.length === 0 && !loading && (
              <div
                style={{
                  color: "var(--muted-text, #6b7280)",
                  fontSize: "0.9rem",
                }}
              >
                No messages yet. Ask something to start the conversation.
              </div>
            )}

            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${
                  msg.sender === "user" ? "bubble-user" : "bubble-ai"
                }`}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 12px",
                    borderRadius:
                      msg.sender === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background:
                      msg.sender === "user"
                        ? "var(--user-bubble-bg, #2563eb)"
                        : "var(--ai-bubble-bg, #e5e7eb)",
                    color:
                      msg.sender === "user"
                        ? "var(--user-bubble-text, #ffffff)"
                        : "var(--ai-bubble-text, #111827)",
                    fontSize: "0.95rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing / skeleton */}
            {loading && (
              <div
                className="chat-bubble bubble-ai"
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginTop: "8px",
                }}
              >
                <div
                  className="typing-skeleton"
                  style={{
                    width: "80px",
                    height: "32px",
                    borderRadius: "16px",
                    background: "var(--skeleton-bg, #e5e7eb)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;