import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  res: NextResponse
) {
  const session = await getServerSession({
    req,
    res,
    ...authOptions,
  });
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: id as string },
    include: {
      team: {
        include: {
          members: {
            include: { user: true },
          },
        },
      },
      tasks: {
        orderBy: {
          createdAt: "asc", // order tasks by creation date
        },
        include: {
          assignedTo: true,
        }
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isMember = project.team.members.some(
    (member) => member.userId === session.user.id
  );

  if (!isMember) {
    return NextResponse.json(
      { error: "Not a member of this project's team" },
      { status: 403 }
    );
  }

  return NextResponse.json(project);
}
