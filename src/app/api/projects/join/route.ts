import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface Session {
  id?: string;
  email?: string;
  role?: string;
}

export async function POST(request: Request) {
  const session = (await getSession()) as Session | null;
  if (!session || !session.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { joinCode } = await request.json();
    
    if (!joinCode || typeof joinCode !== "string") {
      return NextResponse.json({ error: "Join code is required" }, { status: 400 });
    }

    // Find project by join code
    const project = await prisma.project.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
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

    if (!project) {
      return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.id,
          projectId: project.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "You are already a member of this project" }, { status: 400 });
    }

    // Add user as member
    await prisma.projectMember.create({
      data: {
        userId: session.id,
        projectId: project.id,
        role: "MEMBER",
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        owner: project.owner,
      },
    });
  } catch (error) {
    console.error("Join project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
