import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface Session {
  id?: string;
  email?: string;
  role?: string;
}

export async function GET() {
  const session = (await getSession()) as Session | null;
  if (!session || !session.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const accessibleProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: session.id },
        {
          members: {
            some: {
              userId: session.id,
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

  const recentTasks = await prisma.task.findMany({
    where: { projectId: { in: projectIds } },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true } },
      assignedTo: { select: { name: true } },
    }
  });

  return NextResponse.json({
    stats: {
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,
      projectsCount,
    },
    recentTasks,
  });
}
