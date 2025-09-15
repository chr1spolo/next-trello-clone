
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  authOptions,
  prismaClientDefault as prisma,
} from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

export async function POST(req: NextRequest, res: NextResponse) {
  const session = await getServerSession({
    req,
    res,
    ...authOptions,
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  

  const { title, projectId, assignedId } = await req.json();
  if (!title || !projectId) {
    return NextResponse.json(
      { error: "Title and project ID are required" },
      { status: 400 }
    );
  }

  // Opcional: Verificar que el usuario pertenece al proyecto
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { team: { include: { members: true } } },
  });
  if (
    !project ||
    !project.team.members.some((m) => m.userId === session.user.id)
  ) {
    return NextResponse.json(
      { error: "Not authorized to add tasks to this project" },
      { status: 403 }
    );
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        projectId,
        status: "TO_DO", // Por defecto, todas las tareas se crean en "TO_DO"
        assignedToId: assignedId || null,
      },
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
