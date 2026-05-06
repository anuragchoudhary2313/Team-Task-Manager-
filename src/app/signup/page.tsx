"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell animate-fade-in">
      <aside className="auth-panel">
        <p className="auth-panel__eyebrow">Join the workspace</p>
        <h1 className="auth-panel__title">Make the team visible.</h1>
        <p className="auth-panel__copy">
          Create your account, choose a role, and start moving projects and tasks through one clean workspace.
        </p>

        <div className="auth-panel__stats">
          <div className="auth-panel__stat">
            <span className="auth-panel__stat-value">2</span>
            <span className="auth-panel__stat-label">roles</span>
          </div>
          <div className="auth-panel__stat">
            <span className="auth-panel__stat-value">1</span>
            <span className="auth-panel__stat-label">task system</span>
          </div>
          <div className="auth-panel__stat">
            <span className="auth-panel__stat-value">∞</span>
            <span className="auth-panel__stat-label">room to scale</span>
          </div>
        </div>
      </aside>

      <div className="auth-card animate-fade-in" style={{ alignSelf: "center" }}>
        <h2 className="auth-card__title">Create account</h2>
        <p className="auth-card__copy">Set up your workspace identity and role.</p>

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: "1.5rem" }}>
          <div className="field">
            <label className="field-label" htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              className="input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              className="input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Account type</label>
            <div className="radio-grid">
              <label className="radio-card" data-active={role === "MEMBER"}>
                <input
                  type="radio"
                  name="role"
                  value="MEMBER"
                  checked={role === "MEMBER"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <div>
                  <div className="radio-card__title">Member</div>
                  <div className="radio-card__copy">Join and collaborate on tasks.</div>
                </div>
              </label>

              <label className="radio-card" data-active={role === "ADMIN"}>
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === "ADMIN"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <div>
                  <div className="radio-card__title">Admin</div>
                  <div className="radio-card__copy">Create projects and manage members.</div>
                </div>
              </label>
            </div>
          </div>

          {error ? <p style={{ color: "var(--error)", fontSize: "0.9rem", margin: 0 }}>{error}</p> : null}

          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
