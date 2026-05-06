"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        <p className="auth-panel__eyebrow">Welcome back</p>
        <h1 className="auth-panel__title">Return to the workboard.</h1>
        <p className="auth-panel__copy">
          TaskFlow keeps the team’s projects, members, and deadlines in one place so you can get moving in seconds.
        </p>

        <div className="auth-panel__stats">
          <div className="auth-panel__stat">
            <span className="auth-panel__stat-value">1</span>
            <span className="auth-panel__stat-label">workspace</span>
          </div>
          <div className="auth-panel__stat">
            <span className="auth-panel__stat-value">24/7</span>
            <span className="auth-panel__stat-label">project visibility</span>
          </div>
          <div className="auth-panel__stat">
            <span className="auth-panel__stat-value">0</span>
            <span className="auth-panel__stat-label">guesswork</span>
          </div>
        </div>
      </aside>

      <div className="auth-card animate-fade-in" style={{ alignSelf: "center" }}>
        <h2 className="auth-card__title">Sign in</h2>
        <p className="auth-card__copy">Use your workspace credentials to continue.</p>

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: "1.5rem" }}>
          <div className="field">
            <label className="field-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? <p style={{ color: "var(--error)", fontSize: "0.9rem", margin: 0 }}>{error}</p> : null}

          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-card__footer">
          Don&apos;t have an account? <Link href="/signup" style={{ color: "var(--primary)", fontWeight: 700 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
