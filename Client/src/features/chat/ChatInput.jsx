import { useState } from "react";

const ChatInput = ({ onSend, loading }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg-card)",
      padding: "16px 24px",
    }}>
      <div style={{
        maxWidth: "860px",
        margin: "0 auto",
        display: "flex",
        gap: "10px",
        alignItems: "flex-end",
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this paper... (Enter to send)"
          disabled={loading}
          rows={1}
          style={{
            flex: 1,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            fontSize: "0.875rem",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            maxHeight: "120px",
            overflowY: "auto",
            transition: "border-color 0.2s",
            opacity: loading ? 0.6 : 1,
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
        />

        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? "var(--bg-elevated)" : "var(--accent)",
            color: loading || !input.trim() ? "var(--text-muted)" : "#0f0f0f",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 18px",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          {loading ? (
            <span style={{
              width: 14,
              height: 14,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
          ) : "↑"}
        </button>
      </div>

      <p style={{
        maxWidth: "860px",
        margin: "6px auto 0",
        fontSize: "0.68rem",
        color: "var(--text-muted)",
        textAlign: "center",
      }}>
        Answers are grounded in your paper only
      </p>
    </div>
  );
};

export default ChatInput;