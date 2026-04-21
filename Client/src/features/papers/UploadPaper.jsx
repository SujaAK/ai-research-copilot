import { useState } from "react";
import { uploadPaper } from "../../services/paperApi";
import Button from "../../components/ui/Button";

const UploadPaper = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      if (!title) setTitle(f.name.replace(".pdf", ""));
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadPaper(file, title);
      setFile(null);
      setTitle("");
      if (onUploadSuccess) onUploadSuccess(res);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "24px",
    }}>
      <h2 style={{
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "var(--text-primary)",
        marginBottom: "16px",
      }}>
        Upload Paper
      </h2>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("pdf-input").click()}
          style={{
            flex: 1,
            minWidth: "200px",
            border: `1px dashed ${dragOver ? "var(--accent)" : file ? "var(--success)" : "var(--border-light)"}`,
            borderRadius: "var(--radius-sm)",
            padding: "14px 18px",
            cursor: "pointer",
            background: dragOver ? "var(--accent-dim)" : file ? "rgba(76,175,125,0.05)" : "var(--bg-elevated)",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{file ? "📄" : "☁️"}</span>
          <div>
            <p style={{ fontSize: "0.8rem", color: file ? "var(--success)" : "var(--text-secondary)", fontWeight: 500 }}>
              {file ? file.name : "Click or drag PDF here"}
            </p>
            {!file && (
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Max 20MB
              </p>
            )}
          </div>
          <input
            id="pdf-input"
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Title input */}
        {file && (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paper title"
            style={{
              flex: 1,
              minWidth: "160px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              fontSize: "0.875rem",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        )}

        {file && (
          <Button onClick={handleUpload} loading={loading}>
            Upload
          </Button>
        )}

      </div>
    </div>
  );
};

export default UploadPaper;