import { useState } from "react";
import SourcesPanel from "./SourcesPanel";
import SimilarPapersPanel from "./SimilarPapersPanel";

// ─────────────────────────────────────────────────────────────
// Lightweight markdown renderer — no external library needed.
// Handles: **bold**, bullet lists (- or *), numbered lists,
// inline citations [N], and paragraph breaks.
// ─────────────────────────────────────────────────────────────
const renderMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines (used as paragraph separators)
    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading: **Title** or ## Title on its own line
    if (/^\*\*(.+)\*\*$/.test(line.trim()) || /^#{1,3}\s/.test(line)) {
      const content = line.replace(/^\*\*|\*\*$/g, "").replace(/^#{1,3}\s/, "");
      elements.push(
        <p key={i} style={{
          fontWeight: 700,
          color: "var(--text-primary)",
          fontSize: "0.9rem",
          marginBottom: "6px",
          marginTop: elements.length > 0 ? "14px" : 0,
        }}>
          {inlineFormat(content)}
        </p>
      );
      i++;
      continue;
    }

    // Bullet list block
    if (/^[-*•]\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{
          paddingLeft: "18px",
          margin: "6px 0 10px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          {items.map((item, j) => (
            <li key={j} style={{
              fontSize: "0.875rem",
              color: "var(--text-primary)",
              lineHeight: 1.65,
              listStyleType: "disc",
            }}>
              {inlineFormat(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list block
    if (/^\d+\.\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{
          paddingLeft: "20px",
          margin: "6px 0 10px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          {items.map((item, j) => (
            <li key={j} style={{
              fontSize: "0.875rem",
              color: "var(--text-primary)",
              lineHeight: 1.65,
            }}>
              {inlineFormat(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{
        fontSize: "0.875rem",
        lineHeight: 1.7,
        color: "var(--text-primary)",
        marginBottom: "8px",
      }}>
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
};

// Inline formatting: **bold**, *italic*, and [N] citation badges
const inlineFormat = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\])/g);

  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (/^\[\d+\]$/.test(part)) {
      return (
        <sup key={i} style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--accent-dim)",
          color: "var(--accent)",
          border: "1px solid rgba(201,169,110,0.3)",
          borderRadius: "4px",
          fontSize: "0.62rem",
          fontWeight: 700,
          padding: "0 4px",
          margin: "0 1px",
          verticalAlign: "super",
          lineHeight: 1.4,
        }}>
          {part}
        </sup>
      );
    }
    return part;
  });
};


// ─────────────────────────────────────────────────────────────
// MessageBubble
// ─────────────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const [showSources, setShowSources] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

  const hasSources = !isUser && message.sources?.length > 0;
  const hasSimilar = !isUser && message.similarPapers?.length > 0;

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "12px",
      animation: "fadeUp 0.3s ease forwards",
    }}>
      {/* Assistant avatar */}
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

        {/* Bubble */}
        <div style={{
          padding: "12px 16px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? "var(--accent)" : "var(--bg-card)",
          color: isUser ? "#0f0f0f" : "var(--text-primary)",
          border: isUser ? "none" : "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}>
          {message.error ? (
            <span style={{ fontSize: "0.875rem", color: "var(--error)" }}>{message.text}</span>
          ) : isUser ? (
            <p style={{ fontSize: "0.875rem", lineHeight: 1.65, fontWeight: 500 }}>
              {message.text}
            </p>
          ) : (
            <div>{renderMarkdown(message.text)}</div>
          )}
        </div>

        {/* Sources + similar papers toggles */}
        {(hasSources || hasSimilar) && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "0 4px" }}>
            {hasSources && (
              <button
                onClick={() => setShowSources(!showSources)}
                style={{
                  background: "none", border: "none",
                  color: "var(--text-muted)", fontSize: "0.72rem",
                  cursor: "pointer", padding: 0,
                  fontFamily: "var(--font-body)",
                  display: "flex", alignItems: "center", gap: "4px",
                }}
              >
                <span>{showSources ? "▾" : "▸"}</span>
                {message.sources.length} source{message.sources.length !== 1 ? "s" : ""}
              </button>
            )}
            {hasSimilar && (
              <button
                onClick={() => setShowSimilar(!showSimilar)}
                style={{
                  background: "none", border: "none",
                  color: showSimilar ? "var(--accent)" : "var(--text-muted)",
                  fontSize: "0.72rem", cursor: "pointer", padding: 0,
                  fontFamily: "var(--font-body)",
                  display: "flex", alignItems: "center", gap: "4px",
                  transition: "color 0.15s",
                }}
              >
                <span>{showSimilar ? "▾" : "▸"}</span>
                {message.similarPapers.length} related paper{message.similarPapers.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        {hasSources && showSources && <SourcesPanel sources={message.sources} />}
        {hasSimilar && showSimilar && <SimilarPapersPanel papers={message.similarPapers} />}
      </div>
    </div>
  );
};

export default MessageBubble;