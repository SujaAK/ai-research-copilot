/**
 * Displays arXiv paper suggestions returned alongside a chat answer.
 */
const SimilarPapersPanel = ({ papers = [] }) => {
  if (!papers.length) return null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      animation: "fadeIn 0.2s ease",
    }}>
      <p style={{
        fontSize: "0.68rem",
        fontWeight: 600,
        color: "var(--accent)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "0 2px",
      }}>
        Related papers on arXiv
      </p>

      {papers.map((paper, i) => (
        <a
          key={i}
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
            textDecoration: "none",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)";
            e.currentTarget.style.background = "var(--accent-dim)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--bg-elevated)";
          }}
        >
          <p style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "4px",
            lineHeight: 1.4,
          }}>
            {paper.title}
          </p>

          {paper.authors?.length > 0 && (
            <p style={{
              fontSize: "0.7rem",
              color: "var(--accent)",
              marginBottom: "6px",
            }}>
              {paper.authors.join(", ")}
            </p>
          )}

          <p style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {paper.summary}
          </p>

          <p style={{
            marginTop: "6px",
            fontSize: "0.68rem",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <span>↗</span> View on arXiv
          </p>
        </a>
      ))}
    </div>
  );
};

export default SimilarPapersPanel;