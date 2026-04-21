import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const TypingIndicator = () => (
  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "8px" }}>
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      borderBottomLeftRadius: "4px",
      padding: "12px 16px",
      display: "flex",
      gap: "5px",
      alignItems: "center",
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--accent)",
          display: "inline-block",
          animation: `pulse 1.2s ease ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  </div>
);

const ChatWindow = ({ messages = [], loading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      padding: "24px 0",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}>
      {messages.length === 0 ? (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          gap: "12px",
          paddingTop: "60px",
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--accent-dim)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
          }}>
            💬
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>
              Start a conversation
            </p>
            <p style={{ fontSize: "0.8rem" }}>
              Ask anything about this paper
            </p>
          </div>
        </div>
      ) : (
        messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))
      )}

      {loading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;