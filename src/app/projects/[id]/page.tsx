"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";

import { Badge, EmptyState, PageHeader, SectionCard } from "@/components/surface";

interface ProjectMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  role: string;
  joinedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: ProjectMember[];
  _count: {
    tasks: number;
  };
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchProjectAndMembers = useCallback(async () => {
    try {
      setLoading(true);
      const [projectRes, membersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/members`),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);

        const currentUserSession = await fetch("/api/auth/session").catch(() => null);
        if (currentUserSession?.ok) {
          const session = await currentUserSession.json();
          if (projectData.owner.id === session.id) {
            setUserRole("OWNER");
          } else {
            const memberRole = projectData.members.find((member: ProjectMember) => member.user.id === session.id)?.role;
            setUserRole(memberRole || "VIEWER");
          }
        }
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // Initial client-side bootstrap for the project detail workspace.
    (async () => {
      await fetchProjectAndMembers();
    })();
  }, [fetchProjectAndMembers]);

  async function handleRemoveMember(userId: string) {
    if (!confirm("Remove this member from the project?")) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchProjectAndMembers();
      } else {
        setError("Failed to remove member");
      }
    } catch {
      setError("Failed to remove member");
    }
  }

  if (loading) return <div className="surface-card" style={{ textAlign: "center" }}>Loading project workspace...</div>;
  if (!project) return <div className="surface-card" style={{ textAlign: "center", color: "var(--error)" }}>Project not found</div>;

  const canManageMembers = userRole === "OWNER";
  const teamMembers = members.filter((member) => member.user.id !== project.owner.id);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(project.joinCode);
    alert("Join code copied to clipboard!");
  };

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Project dossier"
        title={project.name}
        description={project.description || "No description"}
        actions={
          <Link href="/projects" className="button button-secondary">
            Back to projects
          </Link>
        }
      />

      <div className="surface-banner">
        <div>
          <p className="banner-title">Ownership</p>
          <p className="banner-copy">{project.owner.name} · {project.owner.email}</p>
        </div>
        <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
          <Badge tone="accent">{project._count.tasks} tasks</Badge>
          <Badge tone={canManageMembers ? "positive" : "muted"}>{canManageMembers ? "member admin" : "viewer"}</Badge>
        </div>
      </div>

      {error ? (
        <div className="surface-card" style={{ borderColor: "rgba(194, 65, 12, 0.2)", color: "var(--error)" }}>
          {error}
        </div>
      ) : null}

      {canManageMembers ? (
        <SectionCard title="Invite members" description="Share this code with team members to let them join the project.">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: "0.5rem", borderLeft: "3px solid var(--color-accent)" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Project join code</p>
              <p style={{ fontSize: "1.5rem", fontFamily: "monospace", fontWeight: "600", color: "var(--color-text)", letterSpacing: "0.1em" }}>{project.joinCode}</p>
            </div>
            <button onClick={copyJoinCode} className="button button-secondary" style={{ whiteSpace: "nowrap" }}>
              Copy code
            </button>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title={`Team members (${teamMembers.length})`} description="The people with access to this project.">
        <div className="section-stack">
          <div className="surface-banner" style={{ padding: "1rem 1.1rem" }}>
            <div>
              <p className="banner-title">Project owner</p>
              <p className="banner-copy">{project.owner.name} · {project.owner.email}</p>
            </div>
            <Badge tone="accent">owner</Badge>
          </div>

          {teamMembers.length === 0 ? (
            <EmptyState title="No team members yet" description={canManageMembers ? "Add collaborators to start working together." : "Only the owner is listed right now."} />
          ) : (
            teamMembers.map((member) => (
              <div
                key={member.id}
                className="surface-banner"
                style={{ padding: "1rem 1.1rem", background: "rgba(255, 255, 255, 0.6)" }}
              >
                <div>
                  <p className="banner-title">{member.user.name}</p>
                  <p className="banner-copy">{member.user.email} · Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
                {canManageMembers ? (
                  <button
                    onClick={() => handleRemoveMember(member.user.id)}
                    className="button button-danger"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard
        title={`Tasks (${project._count.tasks})`}
        description="Open the dedicated task board for this project."
        actions={
          <Link href={`/projects/${projectId}/tasks`} className="button button-secondary">
            View task board
          </Link>
        }
      >
        <p className="field-help">Use the task board to create, assign, and sequence work for this project.</p>
      </SectionCard>
    </div>
  );
}
