import { useState } from "react"
import { Link } from "react-router-dom"
import "./glass.css"
import "./LoginForm.css"

function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (onSubmit) await onSubmit({ email, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="glass-card"
      style={{
        width: "100%",
        maxWidth: "420px",
        padding: "44px 36px 38px",
        animation: "slideInFromLeft 0.8s ease-out",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
            animation: "appear 1.2s ease-out",
          }}
        >
          Bienvenido a Apex Management
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.45)",
            animation: "appear 1.6s ease-out",
          }}
        >
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="input-wrapper">
          <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13 2 4" />
          </svg>
          <input
            className="glass-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-wrapper">
          <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <input
            className="glass-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input className="glass-checkbox" type="checkbox" defaultChecked />
            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)" }}>Remember me</span>
          </label>
          <Link to="/forgot-password" className="glass-link" style={{ fontSize: "0.82rem" }}>
            Forgot password?
          </Link>
        </div>

        <button className="glass-btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
        Don&apos;t have an account?{" "}
        <Link to="/register" className="glass-link">Sign up</Link>
      </p>
    </div>
  )
}

export default LoginForm
