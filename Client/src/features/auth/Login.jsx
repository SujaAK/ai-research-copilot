import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "./authApi";
import { AuthContext } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIX: Redirect using useEffect (NOT inside render)
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(form);

      login(data.token, {
        _id: data._id,
        name: data.name,
        email: data.email,
      });

      // Optional (safe but not required because of useEffect)
      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      {/* Background */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201,169,110,0.04) 0%, transparent 60%),
                          radial-gradient(circle at 80% 20%, rgba(201,169,110,0.03) 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%",
        maxWidth: "400px",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}>
            Research <span style={{ color: "var(--accent)" }}>Copilot</span>
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Your AI-powered research assistant
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "36px",
          boxShadow: "var(--shadow)",
        }}>
          <h2 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "24px",
            color: "var(--text-primary)",
          }}>
            Sign in
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <Input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            {error && (
              <p style={{
                color: "var(--error)",
                fontSize: "0.8rem",
                padding: "8px 12px",
                background: "rgba(224,92,92,0.08)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(224,92,92,0.2)",
              }}>
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              style={{ width: "100%" }}
            >
              Sign in
            </Button>
          </form>

          <p style={{
            marginTop: "20px",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}>
            No account?{" "}
            <Link
              to="/register"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;