import { useState, useEffect } from "react";
import { getPapers } from "../../services/paperApi";
import { useNavigate } from "react-router-dom";
import UploadPaper from "./UploadPaper";
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
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: cfg.color,
      background: cfg.bg,
      padding: "3px 10px",
      borderRadius: "20px",
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
    }}>
      {status === "processing" && (
        <span style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: cfg.color,
          animation: "pulse 1.2s ease infinite",
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchPapers();
    // Poll every 5s to catch status changes (processing → ready)
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px", animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            color: "var(--text-primary)",
            marginBottom: "6px",
          }}>
            Your Papers
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Upload research papers and start asking questions
          </p>
        </div>

        {/* Upload */}
        <div style={{
          marginBottom: "28px",
          animation: "fadeUp 0.4s ease 0.1s both",
        }}>
          <UploadPaper onUploadSuccess={fetchPapers} />
        </div>

        {/* Papers List */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          animation: "fadeUp 0.4s ease 0.2s both",
        }}>
          <div style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Library
            </h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {papers.length} paper{papers.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <Loader text="Loading papers..." />
          ) : papers.length === 0 ? (
            <div style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📄</div>
              No papers yet — upload your first one above
            </div>
          ) : (
            <div>
              {papers.map((paper, i) => (
                <div
                  key={paper._id}
                  onClick={() => handlePaperClick(paper)}
                  style={{
                    padding: "16px 24px",
                    borderBottom: i < papers.length - 1 ? "1px solid var(--border)" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: paper.status === "ready" ? "pointer" : "default",
                    transition: "background 0.15s",
                    opacity: paper.status === "failed" ? 0.5 : 1,
                  }}
                  onMouseEnter={e => {
                    if (paper.status === "ready") e.currentTarget.style.background = "var(--bg-elevated)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, marginRight: "16px" }}>
                    <p style={{
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {paper.title || paper.fileName}
                    </p>
                    {paper.summary && (
                      <p style={{
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <StatusBadge status={paper.status} />
                    {paper.status === "ready" && (
                      <span style={{ color: "var(--accent)", fontSize: "1rem" }}>→</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;