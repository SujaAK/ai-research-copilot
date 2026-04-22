import { useState } from "react";
import { comparePapers } from "../../services/paperApi";
import Loader from "../../components/ui/Loader";

/**
 * Full-screen modal that shows LLM-generated comparison table for 2 papers.
 * Includes domain detection + cross-domain warning.
 */
const CompareModal = ({ paper1, paper2, onClose }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await comparePapers(paper1._id, paper2._id);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Comparison failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const crossDomain = result && !result.same_domain;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 300, padding: "24px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          width: "100%", maxWidth: "900px",
          maxHeight: "88vh", overflowY: "auto",
          boxShadow: "var(--shadow)",
          animation: "fadeUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 1,
        }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
              Paper Comparison
            </h2>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "0.75rem", color: "var(--accent)",
                background: "var(--accent-dim)", padding: "2px 10px",
                borderRadius: "20px", fontWeight: 500,
              }}>
                {paper1.title.length > 40 ? paper1.title.slice(0, 40) + "…" : paper1.title}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>vs</span>
              <span style={{
                fontSize: "0.75rem", color: "var(--accent)",
                background: "var(--accent-dim)", padding: "2px 10px",
                borderRadius: "20px", fontWeight: 500,
              }}>
                {paper2.title.length > 40 ? paper2.title.slice(0, 40) + "…" : paper2.title}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              color: "var(--text-muted)", cursor: "pointer",
              fontSize: "1.1rem", padding: "4px", flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>

          {/* Not yet generated */}
          {!result && !loading && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "20px", lineHeight: 1.6 }}>
                The AI will analyze both papers and generate a structured comparison table
                across the most relevant dimensions.
              </p>
              {error && (
                <p style={{
                  color: "var(--error)", fontSize: "0.8rem",
                  padding: "8px 14px", background: "rgba(224,92,92,0.08)",
                  borderRadius: "var(--radius-sm)", marginBottom: "16px",
                  border: "1px solid rgba(224,92,92,0.2)",
                }}>
                  {error}
                </p>
              )}
              <button
                onClick={handleCompare}
                style={{
                  background: "var(--accent)", color: "#0f0f0f",
                  border: "none", borderRadius: "var(--radius-sm)",
                  padding: "10px 28px", fontSize: "0.875rem",
                  fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Generate Comparison
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ padding: "48px 0" }}>
              <Loader size={28} text="Analyzing both papers… this may take 20-30 seconds" />
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div>
              {/* Domain badges */}
              <div style={{
                display: "flex", gap: "10px", alignItems: "center",
                marginBottom: "16px", flexWrap: "wrap",
              }}>
                <DomainBadge label={result.domain_1} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>vs</span>
                <DomainBadge label={result.domain_2} />
              </div>

              {/* Cross-domain warning */}
              {crossDomain && (
                <div style={{
                  background: "rgba(224,160,92,0.08)",
                  border: "1px solid rgba(224,160,92,0.25)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  marginBottom: "20px",
                  display: "flex", gap: "10px", alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--warning)", lineHeight: 1.6 }}>
                    These papers appear to be from different domains
                    ({result.domain_1} vs {result.domain_2}).
                    The comparison is for reference only and may not be meaningful across all dimensions.
                  </p>
                </div>
              )}

              {/* Comparison table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr>
                      <th style={thStyle("#1a1a1a", "160px")}>Dimension</th>
                      <th style={thStyle("var(--bg-elevated)")}>
                        <span style={{ color: "var(--accent)" }}>
                          {result.paper1?.title?.length > 35
                            ? result.paper1.title.slice(0, 35) + "…"
                            : result.paper1?.title || "Paper 1"}
                        </span>
                      </th>
                      <th style={thStyle("var(--bg-elevated)")}>
                        <span style={{ color: "var(--accent)" }}>
                          {result.paper2?.title?.length > 35
                            ? result.paper2.title.slice(0, 35) + "…"
                            : result.paper2?.title || "Paper 2"}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.dimensions?.map((dim, i) => (
                      <tr key={i} style={{
                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                      }}>
                        <td style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid var(--border)",
                          borderRight: "1px solid var(--border)",
                          fontWeight: 600,
                          color: "var(--accent)",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                          fontSize: "0.78rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}>
                          {dim.label}
                        </td>
                        <td style={tdStyle}>{dim.paper_1 || "—"}</td>
                        <td style={{ ...tdStyle, borderRight: "none" }}>{dim.paper_2 || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Regenerate */}
              <div style={{ marginTop: "20px", textAlign: "right" }}>
                <button
                  onClick={handleCompare}
                  style={{
                    background: "none",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-muted)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 16px", fontSize: "0.78rem",
                    cursor: "pointer", fontFamily: "var(--font-body)",
                  }}
                >
                  ↺ Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DomainBadge = ({ label }) => (
  <span style={{
    fontSize: "0.72rem", fontWeight: 600,
    color: "var(--text-secondary)",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    padding: "3px 10px", borderRadius: "20px",
  }}>
    {label}
  </span>
);

const thStyle = (bg, width) => ({
  padding: "12px 16px",
  background: bg,
  borderBottom: "1px solid var(--border)",
  borderRight: "1px solid var(--border)",
  textAlign: "left",
  color: "var(--text-secondary)",
  fontWeight: 600,
  fontSize: "0.78rem",
  ...(width ? { width } : {}),
});

const tdStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid var(--border)",
  borderRight: "1px solid var(--border)",
  color: "var(--text-secondary)",
  lineHeight: 1.65,
  verticalAlign: "top",
};

export default CompareModal;