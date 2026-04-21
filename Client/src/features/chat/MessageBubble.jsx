import { useState } from "react";
import SourcesPanel from "./SourcesPanel";

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const [showSources, setShowSources] = useState(false);
  const hasSources = !isUser && message.sources?.length > 0;

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "12px",
      animation: "fadeUp 0.3s ease forwards",
    }}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--accent-dim)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          marginRight: "10px",
          flexShrink: 0,
          marginTop: "4px",
        }}>
          ✦
        </div>
      )}

      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{
          padding: "12px 16px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? "var(--accent)" : "var(--bg-card)",
          color: isUser ? "#0f0f0f" : "var(--text-primary)",
          border: isUser ? "none" : "1px solid var(--border)",
          fontSize: "0.875rem",
          lineHeight: 1.65,
          fontWeight: isUser ? 500 : 400,
          boxShadow: "var(--shadow-sm)",
        }}>
          {message.error ? (
            <span style={{ color: "var(--error)" }}>{message.text}</span>
          ) : (
            message.text
          )}
        </div>

        {/* Sources toggle */}
        {hasSources && (
          <button
            onClick={() => setShowSources(!showSources)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.72rem",
              cursor: "pointer",
              textAlign: "left",
              padding: "0 4px",
              fontFamily: "var(--font-body)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{showSources ? "▾" : "▸"}</span>
            {message.sources.length} source{message.sources.length !== 1 ? "s" : ""}
          </button>
        )}

        {hasSources && showSources && (
          <SourcesPanel sources={message.sources} />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;