import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "./authApi";
import { AuthContext } from "../../context/AuthContext";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const Register = () => {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Redirect AFTER render (correct way)
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(form);

      // store user in context
      login(data.token, {
        _id: data._id,
        name: data.name,
        email: data.email,
      });

      // ❌ no navigate here (handled by useEffect)

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // optional: prevent flicker if already logged in
  if (user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 80% 50%, rgba(201,169,110,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          animation: "fadeUp 0.5s ease forwards",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            Research{" "}
            <span style={{ color: "var(--accent)" }}>Copilot</span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
            }}
          >
            Start exploring your research papers
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "36px",
            boxShadow: "var(--shadow)",
          }}
        >
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "24px",
              color: "var(--text-primary)",
            }}
          >
            Create account
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <Input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
            />

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
              placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={handleChange}
            />

            {error && (
              <p
                style={{
                  color: "var(--error)",
                  fontSize: "0.8rem",
                  padding: "8px 12px",
                  background: "rgba(224,92,92,0.08)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(224,92,92,0.2)",
                }}
              >
                {error}
              </p>
            )}

            <Button type="submit" loading={loading}>
              Create account
            </Button>
          </form>

          <p
            style={{
              marginTop: "20px",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;