import React, { useState } from "react";
import "./ChatMessage.css";

const SOURCE_LABELS = {
  faq: { label: "FAQ Match", color: "#4ade80" },
  ai: { label: "AI Answer", color: "#6c63ff" },
  fallback: { label: "Fallback", color: "#fbbf24" },
  system: { label: "", color: "transparent" },
  error: { label: "Error", color: "#f87171" },
};

export default function ChatMessage({ message, onFeedback }) {
  const { id, role, text, source, matchedQuestion, category, confidence, feedbackGiven, userQuery, timestamp } = message;
  const isBot = role === "bot";
  const srcInfo = SOURCE_LABELS[source] || SOURCE_LABELS.ai;

  const [localFeedback, setLocalFeedback] = useState(feedbackGiven);

  const handleFeedback = (helpful) => {
    setLocalFeedback(helpful);
    onFeedback(id, helpful, userQuery);
  };

  return (
    <div className={`message-row ${isBot ? "bot" : "user"}`}>
      {isBot && (
        <div className="avatar bot-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="5" r="1"/>
          </svg>
        </div>
      )}

      <div className={`bubble-wrap ${isBot ? "bot" : "user"}`}>
        {/* Source badge */}
        {isBot && source && source !== "system" && (
          <div className="source-row">
            <span className="source-badge" style={{ borderColor: srcInfo.color, color: srcInfo.color }}>
              {source === "faq" ? "🎯" : source === "ai" ? "✨" : "⚠️"} {srcInfo.label}
            </span>
            {category && <span className="category-tag">{category}</span>}
            {confidence > 0 && <span className="confidence-bar" style={{ "--pct": `${confidence}%` }} title={`Confidence: ${confidence}%`} />}
          </div>
        )}

        {/* Matched question */}
        {matchedQuestion && (
          <div className="matched-q">Matched: <em>{matchedQuestion}</em></div>
        )}

        {/* Message bubble */}
        <div className={`bubble ${isBot ? "bot-bubble" : "user-bubble"}`}>
          {text.split("\n").map((line, i) => (
            <span key={i}>{line}{i < text.split("\n").length - 1 && <br />}</span>
          ))}
        </div>

        {/* Timestamp + Feedback */}
        <div className="bubble-footer">
          <span className="timestamp">
            {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>

          {isBot && source && source !== "system" && source !== "error" && (
            <div className="feedback-row">
              {localFeedback === undefined ? (
                <>
                  <span className="feedback-label">Helpful?</span>
                  <button className="fb-btn" onClick={() => handleFeedback(true)} title="Yes, helpful">👍</button>
                  <button className="fb-btn" onClick={() => handleFeedback(false)} title="Not helpful">👎</button>
                </>
              ) : (
                <span className="feedback-thanks">
                  {localFeedback ? "✅ Thanks for your feedback!" : "📝 Noted — we'll improve this answer."}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!isBot && (
        <div className="avatar user-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}
    </div>
  );
}
