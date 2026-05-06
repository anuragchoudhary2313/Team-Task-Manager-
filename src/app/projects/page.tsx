import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, PageHeader, SectionCard, StatCard } from "@/components/surface";

type ProjectsSession = {
  id?: string | null;
  email?: string | null;
  role?: string | null;
};

type ProjectCard = {
  id: string;
  name: string;
  description: string | null;
  owner: { name: string | null; email: string };
  _count: { tasks: number; members: number };
};

async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ProjectsPage() {
  const session = (await getSession()) as ProjectsSession | null;
  if (!session || !session.id) redirect("/login");

  const projects = (await getProjects(session.id)) as ProjectCard[];

  const totalTasks = projects.reduce((sum, project) => sum + project._count.tasks, 0);

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Track active initiatives, ownership, and the task load behind each team effort."
        actions={
          session.role === "ADMIN" ? (
            <Link href="/projects/new" className="button button-primary">
              New project
            </Link>
          ) : null
        }
      />

      <div className="stat-grid">
        <StatCard label="Projects" value={projects.length} hint="Active workstreams" />
        <StatCard label="Total tasks" value={totalTasks} hint="Across every project" tone="accent" />
        <StatCard label="Owned by you" value={projects.filter((project) => project.owner.email === session.email).length} hint="Projects you started" tone="positive" />
        <StatCard label="Role" value={session.role ?? "MEMBER"} hint="Workspace access level" tone="warning" />
      </div>

      <SectionCard title="Project gallery" description="A quick scan of ownership, scope, and current task density.">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description={session.role === "ADMIN" ? "Create your first project to set the team up for work." : "Ask an admin to create the first workspace project."}
            action={
              session.role === "ADMIN" ? (
                <Link href="/projects/new" className="button button-primary">
                  Create project
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {projects.map((project) => (
              <article key={project.id} className="surface-card" style={{ display: "grid", gap: "1rem" }}>
                <div className="stack" style={{ gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "start" }}>
                    <h3 className="surface-card__title" style={{ fontSize: "1.2rem" }}>{project.name}</h3>
                    <Badge tone="accent">{project._count.tasks} tasks</Badge>
                  </div>
                  <p className="surface-card__description" style={{ minHeight: "3.5rem" }}>
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="surface-banner" style={{ padding: "1rem 1.1rem" }}>
                  <div>
                    <p className="banner-title">Owner</p>
                    <p className="banner-copy">{project.owner.name}</p>
                  </div>
                  <Badge tone="muted">{project._count.members} members</Badge>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                  <span className="field-help">{project._count.tasks} tasks</span>
                  <Link href={`/projects/${project.id}`} className="button button-secondary">
                    Open project
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
