import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateJoinCode } from "@/lib/join-code";

interface Session {
  id?: string;
  email?: string;
  role?: string;
}

export async function GET() {
  const session = (await getSession()) as Session | null;
  if (!session || !session.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: session.id },
        {
          members: {
            some: { userId: session.id },
          },
        },
      ],
    },
    include: {
      owner: { select: { name: true, email: true } },
      members: {
        select: {
          user: { select: { id: true, name: true, email: true } },
          role: true,
        },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = (await getSession()) as Session | null;
  if (!session || !session.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    let joinCode = generateJoinCode();
    let codeExists = await prisma.project.findUnique({ where: { joinCode } });
    
    // Retry up to 5 times if code already exists (extremely unlikely)
    for (let i = 0; i < 5 && codeExists; i++) {
      joinCode = generateJoinCode();
      codeExists = await prisma.project.findUnique({ where: { joinCode } });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        joinCode,
        ownerId: session.id,
        members: {
          create: {
            userId: session.id,
            role: "OWNER",
          },
        },
      },
      include: {
        owner: { select: { name: true, email: true } },
        members: {
          select: {
            user: { select: { id: true, name: true, email: true } },
            role: true,
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
