"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, SectionCard } from "@/components/surface";

export default function JoinProjectPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/projects/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase() }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(true);
        setJoinCode("");
        
        // Redirect to the project after a short delay
        setTimeout(() => {
          router.push(`/projects/${data.project.id}`);
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to join project");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Join a team project"
        title="Enter project code"
        description="Ask your project admin for the join code to access a shared project."
      />

      {success && (
        <div className="surface-card" style={{ borderColor: "rgba(34, 197, 94, 0.2)", backgroundColor: "rgba(34, 197, 94, 0.05)", color: "#22C55E" }}>
          ✓ Successfully joined the project! Redirecting...
        </div>
      )}

      {error && (
        <div className="surface-card" style={{ borderColor: "rgba(194, 65, 12, 0.2)", color: "var(--error)" }}>
          {error}
        </div>
      )}

      <SectionCard title="Project join code" description="Enter the 8-character code provided by your project administrator.">
        <form onSubmit={handleJoin}>
          <div className="field">
            <label className="field-label" htmlFor="join-code">
              Join code
            </label>
            <input
              id="join-code"
              type="text"
              className="input"
              placeholder="e.g., A7FX9KJ2"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
              disabled={loading || success}
              required
              style={{ fontSize: "1.25rem", letterSpacing: "0.15em", fontFamily: "monospace", fontWeight: "600" }}
            />
            <p className="field-help">The code is case-insensitive and consists of letters and numbers.</p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="submit"
              className="button button-primary"
              disabled={!joinCode || loading || success}
            >
              {loading ? "Joining..." : "Join project"}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => router.push("/projects")}
              disabled={loading || success}
            >
              Cancel
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Don't have a code?" description="Contact your project administrator for an invite.">
        <p className="field-help">
          Project codes are provided by the team lead or project owner. If you&apos;re not sure who that is, reach out to your manager or team coordinator.
        </p>
      </SectionCard>
    </div>
  );
}
