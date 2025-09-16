// app/api/invitations/[token]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, prismaClientDefault as prisma } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
  res: NextResponse
) {
  const session = await getServerSession({
    req,
    res,
    ...authOptions,
  });
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = params;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { team: true },
  });

  if (!invitation) {
    return NextResponse.json(
      { error: "Invalid invitation link" },
      { status: 404 }
    );
  }

  if (invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invitation has already been used or has expired" },
      { status: 400 }
    );
  }


  if (invitation.email !== session.user.email) {
    return NextResponse.json(
      { error: "This invitation is not for you" },
      { status: 403 }
    );
  }

  try {
    await prisma.$transaction([
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
      prisma.userTeam.create({
        data: {
          userId: session.user.id,
          teamId: invitation.teamId,
          role: "MEMBER", // join as members
        },
      }),
    ]);

    return NextResponse.json({
      message: "Invitation accepted. You are now a member of the team.",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
