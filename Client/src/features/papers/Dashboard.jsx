import { useState, useEffect } from "react";
import { getPapers, deletePaper } from "../../services/paperApi";
import { useNavigate } from "react-router-dom";
import UploadPaper from "./UploadPaper";
import CompareModal from "./CompareModal";
import Loader from "../../components/ui/Loader";

const statusConfig = {
  uploaded:   { label: "Uploaded",   color: "#8a8680", bg: "rgba(138,134,128,0.1)" },
  processing: { label: "Processing", color: "#c9a96e", bg: "rgba(201,169,110,0.1)" },
  ready:      { label: "Ready",      color: "#4caf7d", bg: "rgba(76,175,125,0.1)"  },
  failed:     { label: "Failed",     color: "#e05c5c", bg: "rgba(224,92,92,0.1)"   },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.uploaded;
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em",
      textTransform: "uppercase", color: cfg.color, background: cfg.bg,
      padding: "3px 10px", borderRadius: "20px",
      display: "inline-flex", alignItems: "center", gap: "5px",
    }}>
      {status === "processing" && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: cfg.color, animation: "pulse 1.2s ease infinite",
          display: "inline-block",
        }} />
      )}
      {cfg.label}
    </span>
  );
};

const Dashboard = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selected, setSelected] = useState([]);       // max 2 paper IDs
  const [compareOpen, setCompareOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPapers();
    const interval = setInterval(fetchPapers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPapers = async () => {
    try {
      const data = await getPapers();
      setPapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (paper) => {
    if (paper.status !== "ready") return;
    navigate(`/paper/${paper._id}`);
  };

  const handleDeleteClick = (e, paperId) => {
    e.stopPropagation();
    setConfirmDelete(paperId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete);
    setConfirmDelete(null);
    try {
      await deletePaper(confirmDelete);
      setPapers(prev => prev.filter(p => p._id !== confirmDelete));
      setSelected(prev => prev.filter(id => id !== confirmDelete));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete paper");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (e, paperId) => {
    e.stopPropagation();
    setSelected(prev => {
      if (prev.includes(paperId)) return prev.filter(id => id !== paperId);
      if (prev.length >= 2) return [prev[1], paperId]; // replace oldest
      return [...prev, paperId];
    });
  };

  const readyPapers = papers.filter(p => p.status === "ready");
  const canCompare = selected.length === 2;
  const comparePaper1 = papers.find(p => p._id === selected[0]);
  const comparePaper2 = papers.find(p => p._id === selected[1]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px", animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "2rem",
            color: "var(--text-primary)", marginBottom: "6px",
          }}>
            Your Papers
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Upload research papers and start asking questions
          </p>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease 0.1s both" }}>
          <UploadPaper onUploadSuccess={fetchPapers} />
        </div>

        {/* Compare bar — appears when 2 ready papers are selected */}
        {selected.length > 0 && (
          <div style={{
            marginBottom: "16px",
            background: "var(--accent-dim)",
            border: "1px solid rgba(201,169,110,0.3)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeIn 0.2s ease",
          }}>
            <p style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 500 }}>
              {selected.length === 1
                ? "Select one more ready paper to compare"
                : "2 papers selected — ready to compare"}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setSelected([])}
                style={{
                  background: "none", border: "1px solid rgba(201,169,110,0.3)",
                  color: "var(--text-muted)", borderRadius: "var(--radius-sm)",
                  padding: "5px 12px", fontSize: "0.78rem", cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Clear
              </button>
              {canCompare && (
                <button
                  onClick={() => setCompareOpen(true)}
                  style={{
                    background: "var(--accent)", border: "none",
                    color: "#0f0f0f", borderRadius: "var(--radius-sm)",
                    padding: "5px 16px", fontSize: "0.78rem",
                    fontWeight: 600, cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  ⇄ Compare Papers
                </button>
              )}
            </div>
          </div>
        )}

        {/* Papers list */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", overflow: "hidden",
          animation: "fadeUp 0.4s ease 0.2s both",
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Library
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {readyPapers.length >= 2 && (
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  ✓ Select 2 papers to compare
                </span>
              )}
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {papers.length} paper{papers.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <Loader text="Loading papers..." />
          ) : papers.length === 0 ? (
            <div style={{
              padding: "48px 24px", textAlign: "center",
              color: "var(--text-muted)", fontSize: "0.875rem",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📄</div>
              No papers yet — upload your first one above
            </div>
          ) : (
            <div>
              {papers.map((paper, i) => {
                const isSelected = selected.includes(paper._id);
                const isReady = paper.status === "ready";

                return (
                  <div
                    key={paper._id}
                    onClick={() => handlePaperClick(paper)}
                    style={{
                      padding: "16px 24px",
                      borderBottom: i < papers.length - 1 ? "1px solid var(--border)" : "none",
                      display: "flex", alignItems: "center", gap: "14px",
                      cursor: isReady ? "pointer" : "default",
                      transition: "background 0.15s",
                      opacity: deletingId === paper._id ? 0.4 : paper.status === "failed" ? 0.5 : 1,
                      background: isSelected ? "rgba(201,169,110,0.06)" : "transparent",
                    }}
                    onMouseEnter={e => {
                      if (isReady && !isSelected) e.currentTarget.style.background = "var(--bg-elevated)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isSelected ? "rgba(201,169,110,0.06)" : "transparent";
                    }}
                  >
                    {/* Checkbox — only for ready papers */}
                    {isReady && (
                      <div
                        onClick={e => toggleSelect(e, paper._id)}
                        style={{
                          width: 18, height: 18, borderRadius: "4px", flexShrink: 0,
                          border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-light)"}`,
                          background: isSelected ? "var(--accent)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        {isSelected && (
                          <span style={{ fontSize: "0.6rem", color: "#0f0f0f", fontWeight: 700 }}>✓</span>
                        )}
                      </div>
                    )}
                    {!isReady && <div style={{ width: 18, flexShrink: 0 }} />}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: 500, color: "var(--text-primary)", fontSize: "0.9rem",
                        marginBottom: "4px", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {paper.title || paper.fileName}
                      </p>
                      {paper.summary && (
                        <p style={{
                          fontSize: "0.78rem", color: "var(--text-secondary)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {paper.summary.slice(0, 120)}...
                        </p>
                      )}
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        {new Date(paper.uploadedAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </p>
                    </div>

                    {/* Status + actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      <StatusBadge status={paper.status} />
                      {isReady && <span style={{ color: "var(--accent)", fontSize: "1rem" }}>→</span>}
                      <button
                        onClick={e => handleDeleteClick(e, paper._id)}
                        disabled={deletingId === paper._id}
                        title="Delete paper"
                        style={{
                          background: "none", border: "1px solid transparent",
                          borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
                          cursor: "pointer", padding: "4px 8px", fontSize: "0.78rem",
                          transition: "all 0.15s", lineHeight: 1,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = "var(--error)";
                          e.currentTarget.style.borderColor = "var(--error)";
                          e.currentTarget.style.background = "rgba(224,92,92,0.08)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = "var(--text-muted)";
                          e.currentTarget.style.borderColor = "transparent";
                          e.currentTarget.style.background = "none";
                        }}
                      >
                        {deletingId === paper._id ? "..." : "✕"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          onClick={() => setConfirmDelete(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "28px",
              maxWidth: "360px", width: "90%",
              boxShadow: "var(--shadow)", animation: "fadeUp 0.2s ease",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
              Delete paper?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
              This will permanently delete the paper, its embeddings, and all chat history. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  background: "none", border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)", borderRadius: "var(--radius-sm)",
                  padding: "8px 18px", fontSize: "0.85rem", cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >Cancel</button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  background: "var(--error)", border: "none", color: "#fff",
                  borderRadius: "var(--radius-sm)", padding: "8px 18px",
                  fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Compare modal */}
      {compareOpen && comparePaper1 && comparePaper2 && (
        <CompareModal
          paper1={comparePaper1}
          paper2={comparePaper2}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;