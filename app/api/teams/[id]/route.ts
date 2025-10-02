import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";

import {
  authOptions,
  prismaClientDefault,
} from "@/app/api/auth/[...nextauth]/route";
import { pusher } from "@/lib/pusher";

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

  if (
    !["OWNER", "ADMIN"].includes(
      team.members.find((m) => m.userId === userId)?.role || ""
    )
  ) {
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

        // Get current members excluding the owner
        const currentMembers = await prisma.userTeam.findMany({
          where: {
            teamId: id,
          },
          include: { user: true },
        });

        // get the owner
        const owner = currentMembers.find((m) => m.role === "OWNER");

        const membersToAdd = members.filter(
          (m) =>
            !currentMembers.some(
              (cm) => cm.user.email === m.email || m.email === owner?.user.email
            )
        );

        const membersToRemove = currentMembers.filter(
          (cm) =>
            !members.some((m) => m.email === cm.user.email) &&
            cm.role !== "OWNER" // Prevent removing the owner
        );

        // Add new members
        const newMembersList = await prisma.user.findMany({
          where: {
            email: { in: membersToAdd.map((m) => m.email) },
          },
        });
        console.log("New members to add:", newMembersList);
        await Promise.all(
          newMembersList.map(async (user) => {
            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const newInvitation = await prisma.invitation.create({
              data: {
                email: user.email as string,
                teamId: id,
                token: token,
                expiresAt,
                inviterId: session.user.id,
              },
            });

            await pusher.trigger(
              `user-${newInvitation.email}`,
              "new-invitation",
              {
                teamName: team.name,
                token: newInvitation.token,
                inviterId: session.user.id,
                inviterName: session.user.name,
                id: newInvitation.id,
              }
            );

            console.log("Invitation created:", newInvitation);

            await prisma.userTeam.create({
              data: {
                userId: user.id,
                teamId: id,
                role:
                  membersToAdd.find((m) => m.email === user.email)?.role ||
                  "MEMBER",
              },
            });

            return true;
          })
        );

        // Remove members
        await Promise.all(
          membersToRemove.map((member) =>
            prisma.userTeam.delete({
              where: { userId_teamId: { userId: member.userId, teamId: id } },
            })
          )
        );

        // update roles of existing members
        await Promise.all(
          currentMembers.map((cm) => {
            const newRole = members.find(
              (m) => m.email === cm.user.email
            )?.role;
            if (newRole && newRole !== cm.role && cm.role !== "OWNER") {
              return prisma.userTeam.update({
                where: {
                  userId_teamId: { userId: cm.userId, teamId: id },
                },
                data: { role: newRole },
              });
            }
          })
        );

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
