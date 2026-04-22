const Button = ({ children, onClick, loading, disabled, variant = "primary", style = {}, type = "button" }) => {
  const styles = {
    primary: {
      background: "var(--accent)",
      color: "#0f0f0f",
      border: "none",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid var(--border-light)",
    },
    danger: {
      background: "transparent",
      color: "var(--error)",
      border: "1px solid var(--error)",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        ...styles[variant],
        width: "100%",
        padding: "10px 20px",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.875rem",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading || disabled ? 0.5 : 1,
        transition: "all 0.2s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {loading && (
        <span style={{
          width: 14,
          height: 14,
          border: "2px solid currentColor",
          borderTopColor: "transparent",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      )}
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;