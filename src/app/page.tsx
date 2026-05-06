import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, PageHeader, SectionCard, StatCard, TaskStatusBadge } from "@/components/surface";

type DashboardSession = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type RecentTask = {
  id: string;
  title: string;
  status: string;
  project: { name: string };
  assignedTo: { name: string | null } | null;
};

async function getDashboardData(userId: string) {
  const now = new Date();
  const accessibleProjects = await prisma.project.findMany({
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
    select: { id: true },
  });
  const projectIds = accessibleProjects.map((project) => project.id);

  const [totalTasks, pendingTasks, completedTasks, overdueTasks, projectsCount] = await Promise.all([
    prisma.task.count({ where: { projectId: { in: projectIds } } }),
    prisma.task.count({ where: { projectId: { in: projectIds }, status: { not: "DONE" } } }),
    prisma.task.count({ where: { projectId: { in: projectIds }, status: "DONE" } }),
    prisma.task.count({ 
      where: { 
        projectId: { in: projectIds },
        status: { not: "DONE" },
        dueDate: { lt: now }
      } 
    }),
    prisma.project.count({ where: { id: { in: projectIds } } }),
  ]);

  const recentTasks = (await prisma.task.findMany({
    where: { projectId: { in: projectIds } },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true } },
      assignedTo: { select: { name: true } },
    }
  })) as RecentTask[];

  return {
    stats: { totalTasks, pendingTasks, completedTasks, overdueTasks, projectsCount },
    recentTasks
  };
}

export default async function Dashboard() {
  const session = (await getSession()) as DashboardSession | null;
  
  if (!session || !session.id) {
    redirect("/login");
  }

  const data = await getDashboardData(session.id);
  if (!data) return <div>Error loading dashboard.</div>;

  const { stats, recentTasks } = data;

  const focusText = stats.overdueTasks > 0
    ? `${stats.overdueTasks} overdue task${stats.overdueTasks === 1 ? "" : "s"} need attention.`
    : "No overdue tasks. Keep the momentum moving.";

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Command center"
        title={`Welcome back, ${session?.name ?? "there"}`}
        description="A focused snapshot of what needs attention, what is moving, and what is already closed out."
        actions={
          <>
            <Link href="/projects" className="button button-secondary">
              View projects
            </Link>
            <Link href="/tasks" className="button button-primary">
              Open tasks
            </Link>
          </>
        }
      />

      <div className="surface-banner">
        <div>
          <p className="banner-title">Current focus</p>
          <p className="banner-copy">{focusText}</p>
        </div>
        <Badge tone={stats.overdueTasks > 0 ? "danger" : "positive"}>
          {stats.projectsCount} projects active
        </Badge>
      </div>

      <div className="stat-grid">
        <StatCard label="Total tasks" value={stats.totalTasks} hint="All tasks in the workspace" />
        <StatCard label="Pending" value={stats.pendingTasks} hint="Still in motion" tone="warning" />
        <StatCard label="Completed" value={stats.completedTasks} hint="Closed and delivered" tone="positive" />
        <StatCard label="Overdue" value={stats.overdueTasks} hint="Needs immediate attention" tone="danger" />
      </div>

      <SectionCard
        title="Recent tasks"
        description="The latest work items, their owners, and their current status."
        actions={
          <Link href="/tasks" className="button-link">
            View all tasks
          </Link>
        }
      >
        {recentTasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="Create your first task to see the dashboard come alive."
            action={
              <Link href="/projects" className="button button-primary">
                Start with a project
              </Link>
            }
          />
        ) : (
          <div className="section-stack">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.5fr) auto",
                  gap: "1rem",
                  alignItems: "center",
                  padding: "1rem 0",
                  borderBottom: "1px solid rgba(31, 41, 55, 0.08)",
                }}
              >
                <div>
                  <div className="table-title">{task.title}</div>
                  <p className="table-copy">
                    {task.project.name} - Assigned to {task.assignedTo?.name || "Unassigned"}
                  </p>
                </div>
                <TaskStatusBadge status={task.status} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

