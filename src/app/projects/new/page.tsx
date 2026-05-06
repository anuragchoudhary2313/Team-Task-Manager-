"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { PageHeader, SectionCard } from "@/components/surface";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        router.push("/projects");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create project");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: "760px", margin: "0 auto" }}>
      <PageHeader
        eyebrow="Project setup"
        title="New project"
        description="Define the scope, intent, and ownership of a new initiative before work starts."
        actions={
          <Link href="/projects" className="button button-secondary">
            Cancel
          </Link>
        }
      />

      <SectionCard title="Project details" description="Keep the brief short enough to scan and specific enough to act on.">
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label className="field-label" htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              type="text"
              className="input"
              placeholder="e.g. Marketing Campaign 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              className="textarea"
              placeholder="Describe what this project is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error ? <p style={{ color: "var(--error)", margin: 0 }}>{error}</p> : null}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Link href="/projects" className="button button-secondary">
              Cancel
            </Link>
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
