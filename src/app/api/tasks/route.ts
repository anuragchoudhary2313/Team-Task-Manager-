import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface Session {
  id?: string;
  email?: string;
  role?: string;
}

export async function GET(request: Request) {
  const session = (await getSession()) as Session | null;
  if (!session || !session.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const userId = searchParams.get("userId");

  const tasks = await prisma.task.findMany({
    where: {
      AND: [
        {
          OR: [
            { project: { ownerId: session.id } },
            {
              project: {
                members: {
                  some: {
                    userId: session.id,
                  },
                },
              },
            },
          ],
        },
        ...(projectId ? [{ projectId }] : []),
        ...(userId ? [{ assignedToId: userId }] : []),
      ],
    },
    include: {
      project: { select: { name: true } },
      assignedTo: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = (await getSession()) as Session | null;
  if (!session || !session.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, description, status, priority, dueDate, projectId, assignedToId } = await request.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and Project ID are required" }, { status: 400 });
    }

    // Verify project exists and user is a member
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isMember =
      project.ownerId === session.id ||
      !!(await prisma.projectMember.findFirst({
        where: { projectId, userId: session.id },
      }));

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden: Not a project member" }, { status: 403 });
    }

    // If assignedToId provided, verify they're a project member
    if (assignedToId) {
      const assignee =
        assignedToId === project.ownerId ||
        !!(await prisma.projectMember.findFirst({
          where: { projectId, userId: assignedToId },
        }));

      if (!assignee) {
        return NextResponse.json({ error: "Assignee is not a project member" }, { status: 400 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Task creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = (await getSession()) as Session | null;
  if (!session || !session.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, assignedToId, priority } = await request.json();

    if (!id) return NextResponse.json({ error: "Task ID is required" }, { status: 400 });

    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true, project: { select: { ownerId: true } } },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const isMember =
      existingTask.project.ownerId === session.id ||
      !!(await prisma.projectMember.findFirst({
        where: { projectId: existingTask.projectId, userId: session.id },
      }));

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden: Not a project member" }, { status: 403 });
    }

    if (assignedToId) {
      const assigneeIsMember =
        assignedToId === existingTask.project.ownerId ||
        !!(await prisma.projectMember.findFirst({
          where: { projectId: existingTask.projectId, userId: assignedToId },
        }));

      if (!assigneeIsMember) {
        return NextResponse.json({ error: "Assignee is not a project member" }, { status: 400 });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedToId && { assignedToId }),
        ...(priority && { priority }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
