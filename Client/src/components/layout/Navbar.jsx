import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: "60px",
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(12px)",
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ textDecoration: "none" }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.2rem",
          color: "var(--text-primary)",
          letterSpacing: "0.01em",
        }}>
          Research <span style={{ color: "var(--accent)" }}>Copilot</span>
        </span>
      </Link>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {user && (
          <>
            <Link to="/dashboard" style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
              onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
            >
              Dashboard
            </Link>

            <span style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}>
              {user.name || user.email}
            </span>

            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.color = "var(--accent)";
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = "var(--border-light)";
                e.target.style.color = "var(--text-secondary)";
              }}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;