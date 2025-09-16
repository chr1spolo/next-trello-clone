// app/api/invitations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import {
  authOptions,
  prismaClientDefault as prisma,
} from "@/app/api/auth/[...nextauth]/route";
import { pusher } from "@/lib/pusher";

export const runtime = "nodejs";



export async function GET(req: NextRequest, res: NextResponse) {
  const session = await getServerSession({
    req,
    res,
    ...authOptions,
  });
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invitations = await prisma.invitation.findMany({
    where: {
      email: session.user.email,
      status: "PENDING",
      expiresAt: {
        gt: new Date(), // que no haya expirado
      },
    },
    include: { team: true, inviter: true },
  });

  return NextResponse.json(invitations);
}

export async function POST(req: NextRequest, res: NextResponse) {
  const session = await getServerSession({
    req,
    res,
    ...authOptions,
  });
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, teamId } = await req.json();
  if (!email || !teamId) {
    return NextResponse.json(
      { error: "Email and Team ID are required" },
      { status: 400 }
    );
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  const isOwner = team?.members.some(
    (member) => member.userId === session.user.id && member.role === "OWNER"
  );
  if (!isOwner) {
    return NextResponse.json(
      { error: "Only team owners can send invitations" },
      { status: 403 }
    );
  }

  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  try {
    // Crear un token único para la invitación
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newInvitation = await prisma.invitation.create({
      data: {
        email,
        teamId,
        token,
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

    
    return NextResponse.json(
      { message: "Invitation sent successfully", invitation: newInvitation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
