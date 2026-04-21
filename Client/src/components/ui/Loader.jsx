const Loader = ({ size = 24, text = "" }) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "16px",
      color: "var(--text-muted)",
      fontSize: "0.8rem",
    }}>
      <div style={{
        width: size,
        height: size,
        border: "2px solid var(--border)",
        borderTop: "2px solid var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        flexShrink: 0,
      }} />
      {text && <span>{text}</span>}
    </div>
  );
};

export default Loader;