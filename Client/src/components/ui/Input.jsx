const Input = ({ value, onChange, placeholder, type = "text", name, style = {} }) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 14px",
        fontSize: "0.875rem",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        outline: "none",
        transition: "border-color 0.2s",
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = "var(--accent)"}
      onBlur={e => e.target.style.borderColor = "var(--border)"}
    />
  );
};

export default Input;