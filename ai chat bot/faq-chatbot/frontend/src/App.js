import React, { useState, useEffect, useRef, useCallback } from "react";
import ChatMessage from "./components/ChatMessage";
import FAQPanel from "./components/FAQPanel";
import TypingIndicator from "./components/TypingIndicator";
import "./App.css";

const API = "http://localhost:5000/api";

const WELCOME = {
  id: "welcome",
  role: "bot",
  text: "👋 Hi! I'm your AI-powered FAQ assistant. Ask me anything — I'll match your question to our knowledge base or use AI to help you out.\n\nYou can also browse FAQs in the panel on the right.",
  source: "system",
  timestamp: new Date(),
};

export default function App() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/faqs`)
      .then((r) => r.json())
      .then((d) => { setFaqs(d.faqs); setCategories(d.categories); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const conversationHistory = messages
    .filter((m) => m.role !== "bot" || m.source !== "system")
    .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));

  const sendMessage = useCallback(async (text) => {
    const userMsg = { id: Date.now(), role: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationHistory }),
      });
      const data = await res.json();
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: data.answer,
        source: data.source,
        matchedQuestion: data.matchedQuestion,
        category: data.category,
        confidence: data.confidence,
        userQuery: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: "⚠️ Could not connect to the server. Please make sure the backend is running.", source: "error", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [conversationHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    sendMessage(trimmed);
  };

  const handleFAQClick = (question) => {
    sendMessage(question);
    if (window.innerWidth <= 900) setSidebarOpen(false);
  };

  const handleFeedback = async (messageId, helpful, userQuery) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedbackGiven: helpful } : m))
    );
    try {
      await fetch(`${API}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, helpful, message: userQuery }),
      });
    } catch {}
  };

  const clearChat = () => setMessages([WELCOME]);

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen((p) => !p)} title="Toggle FAQ panel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="logo-text">FAQ<span className="logo-accent">Bot</span></span>
            <span className="logo-badge">AI</span>
          </div>
        </div>
        <div className="header-right">
          <div className="status-dot" />
          <span className="status-text">Online</span>
          <button className="clear-btn" onClick={clearChat} title="Clear chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="main-layout">
        {/* Chat Area */}
        <div className="chat-area">
          <div className="messages-container">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onFeedback={handleFeedback}
              />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="suggestions">
              <p className="suggestions-label">Try asking:</p>
              <div className="suggestions-grid">
                {["How do I reset my password?", "What payment methods do you accept?", "Is my data secure?", "How do I contact support?"].map((q) => (
                  <button key={q} className="suggestion-chip" onClick={() => sendMessage(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form className="input-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question here..."
                disabled={loading}
                autoFocus
              />
              <button className={`send-btn ${loading ? "loading" : ""}`} type="submit" disabled={loading || !input.trim()}>
                {loading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="input-hint">Powered by keyword matching + Claude AI</p>
          </form>
        </div>

        {/* FAQ Sidebar */}
        {sidebarOpen && (
          <FAQPanel faqs={faqs} categories={categories} onSelect={handleFAQClick} onClose={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
}
