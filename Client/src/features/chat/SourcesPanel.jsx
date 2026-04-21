const SourcesPanel = ({ sources = [] }) => {
  if (!sources.length) return null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      animation: "fadeIn 0.2s ease",
    }}>
      {sources.map((src, i) => {
        const score = typeof src.score === "number" ? Math.round(src.score * 100) : null;
        const content = src.content?.length > 220
          ? src.content.slice(0, 220) + "..."
          : src.content || "No content";

        return (
          <div key={i} style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}>
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {src.section || "Unknown section"}
              </span>

              {score !== null && (
                <span style={{
                  fontSize: "0.68rem",
                  color: score >= 70 ? "var(--success)" : "var(--text-muted)",
                  background: score >= 70 ? "rgba(76,175,125,0.1)" : "var(--bg-card)",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  fontWeight: 500,
                }}>
                  {score}% match
                </span>
              )}
            </div>

            <p style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}>
              {content}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default SourcesPanel;