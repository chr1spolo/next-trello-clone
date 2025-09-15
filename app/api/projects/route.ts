import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClientDefault as prisma } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, teamId } = await req.json();
  if (!title || !teamId) {
    return NextResponse.json(
      { error: "Title and Team ID are required" },
      { status: 400 }
    );
  }

  const isMember = await prisma.userTeam.findUnique({
    where: { userId_teamId: { userId: session.user.id as string, teamId } },
  });
  if (!isMember) {
    return NextResponse.json(
      { error: "Not a member of this team" },
      { status: 403 }
    );
  }

  const newProject = await prisma.project.create({
    data: {
      title,
      teamId,
    },
  });

  return NextResponse.json(newProject, { status: 201 });
}
