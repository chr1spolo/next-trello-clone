import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  authOptions,
  prismaClientDefault,
} from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession({
    req,
    ...authOptions,
  });
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const userId = session.user.id as string;
  const team = await prismaClientDefault.team.findUnique({
    where: { id, members: { some: { userId } } },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(team);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession({
    req,
    ...authOptions,
  });
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const userId = session.user.id as string;
  const team = await prismaClientDefault.team.findUnique({
    where: { id, members: { some: { userId } } },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!team) {
    return NextResponse.json(
      { error: "Team not found or unauthorized" },
      { status: 404 }
    );
  }

  if (["OWNER", "ADMIN"].includes(team.members.find((m) => m.userId === userId)?.role || "") === false) {
    return NextResponse.json(
      { error: "Only team owners/admin can update the team" },
      { status: 403 }
    );
  }

  const body: {
    name: string;
    members: Array<{ email: string; role: string }>;
  } = await req.json();
  const { name, members } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid team name" }, { status: 400 });
  }

  if (!Array.isArray(members)) {
    return NextResponse.json(
      { error: "Invalid members list" },
      { status: 400 }
    );
  }

  try {
    const updatedTeam = await prismaClientDefault.$transaction(
      async (prisma) => {
        // Update team name
        const updated = await prisma.team.update({
          where: { id },
          data: { name },
        });

        // Get current members
        const currentMembers = await prisma.userTeam.findMany({
          where: { teamId: id },
          include: { user: true },
        });

        const currentMemberIds = currentMembers.map((m) => m.userId);
        const newMemberEmails = members.map((m) => m.email);

        // Find members to add
        const membersToAdd = currentMembers.filter(
          (cm) => !newMemberEmails.includes(cm.user.email || "")
        );

        // Find members to remove
        const membersToRemove = currentMembers.filter(
          (cm) =>
            newMemberEmails.includes(cm.user.email || "") && cm.role !== "OWNER"
        );

        await prisma.userTeam.createMany({
          data: membersToAdd.map((m) => ({
            teamId: id,
            userId: m.userId,
            role: m.role,
          })),
        });

        // Remove members
        for (const member of membersToRemove) {
          await prisma.userTeam.deleteMany({
            where: {
              teamId: id,
              userId: member.userId,
              role: { not: "OWNER" }, // Prevent removing OWNER
            },
          });
        }

        // Update roles of existing members
        for (const member of currentMembers) {
          const altMember = members.find((m) => m.email === member.user.email);
          if (
            altMember &&
            altMember.role &&
            altMember.role !== member.role &&
            member.role !== "OWNER"
          ) {
            await prisma.userTeam.updateMany({
              where: {
                teamId: id,
                userId: member.userId,
                role: { not: "OWNER" }, // Prevent changing OWNER role
              },
              data: {
                role: member.role,
              },
            });
          }
        }

        return updated;
      }
    );

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}
