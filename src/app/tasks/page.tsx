import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader, PriorityBadge, SectionCard, TaskStatusBadge } from "@/components/surface";

type TaskSession = {
  id?: string | null;
  role?: string | null;
};

type TaskRecord = {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: Date | null;
  project: { name: string };
};

async function getTasksForUser(userId: string) {
  return prisma.task.findMany({
    where: { assignedToId: userId },
    include: {
      project: { select: { name: true } },
      assignedTo: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function TasksPage() {
  const session = (await getSession()) as TaskSession | null;
  if (!session) redirect("/login");

  const tasks = (await getTasksForUser(session.id || "")) as TaskRecord[];

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Work queue"
        title="My Tasks"
        description="Review your workload, spot overdue items, and keep deadlines from slipping."
      />

      <SectionCard title="Task ledger" description="Everything assigned to you in one place.">
        {tasks.length === 0 ? (
          <EmptyState title="No tasks assigned" description="Once work is delegated, it will appear here for quick triage." />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="table-title">{task.title}</div>
                    </td>
                    <td>
                      <p className="table-copy">{task.project.name}</p>
                    </td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="table-copy">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
