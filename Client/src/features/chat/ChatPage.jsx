import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPaperById } from "../../services/paperApi";
import useChat from "../../hooks/useChat";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import Loader from "../../components/ui/Loader";

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [paperLoading, setPaperLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  const { messages, loading, historyLoading, sendMessage } = useChat(
    paper?.status === "ready" ? id : null
  );

  // Poll paper status until ready
  useEffect(() => {
    let interval;

    const fetchPaper = async () => {
      try {
        const data = await getPaperById(id);
        setPaper(data);
        setPaperLoading(false);
        if (data.status === "ready" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
        setPaperLoading(false);
      }
    };

    fetchPaper();
    interval = setInterval(fetchPaper, 4000);
    return () => clearInterval(interval);
  }, [id]);

  if (paperLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <Loader text="Loading paper..." />
      </div>
    );
  }

  if (!paper) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Paper not found.</p>
          <button onClick={() => navigate("/dashboard")} style={{ marginTop: "12px", color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{
        padding: "14px 28px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-card)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "1rem",
              padding: "4px",
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {paper.title || paper.fileName}
            </h1>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px" }}>
              {paper.status === "processing" ? "⏳ Processing paper..." :
               paper.status === "ready" ? "✓ Ready to chat" :
               paper.status === "failed" ? "✗ Processing failed" : "Uploaded"}
            </p>
          </div>
        </div>

        {paper.summary && (
          <button
            onClick={() => setShowSummary(!showSummary)}
            style={{
              background: showSummary ? "var(--accent-dim)" : "transparent",
              border: "1px solid var(--border-light)",
              color: "var(--accent)",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.78rem",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            {showSummary ? "Hide Summary" : "Summary"}
          </button>
        )}
      </div>

      {/* Summary Panel */}
      {showSummary && paper.summary && (
        <div style={{
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 28px",
          animation: "fadeIn 0.2s ease",
        }}>
          <h3 style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}>
            Paper Summary
          </h3>
          <p style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: "720px",
          }}>
            {paper.summary}
          </p>
        </div>
      )}

      {/* Processing State */}
      {paper.status === "processing" && (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          color: "var(--text-secondary)",
        }}>
          <Loader size={32} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 500, marginBottom: "6px" }}>Processing your paper</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Chunking, embedding, and building your RAG chain...
            </p>
          </div>
        </div>
      )}

      {/* Failed State */}
      {paper.status === "failed" && (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--error)",
          fontSize: "0.875rem",
        }}>
          Processing failed. Please try re-uploading the paper.
        </div>
      )}

      {/* Chat */}
      {paper.status === "ready" && (
        <>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", maxWidth: "860px", width: "100%", margin: "0 auto", padding: "0 16px" }}>
            {historyLoading ? (
              <Loader text="Loading conversation..." />
            ) : (
              <ChatWindow messages={messages} loading={loading} />
            )}
          </div>
          <ChatInput onSend={sendMessage} loading={loading} />
        </>
      )}
    </div>
  );
};

export default ChatPage;