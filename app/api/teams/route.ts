import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  authOptions,
  prismaClientDefault,
} from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession({
    req,
    ...authOptions,
  });
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const userTeams = await prismaClientDefault.userTeam.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          projects: true,
        },
      },
    },
  });

  return NextResponse.json(userTeams.map((ut) => ut.team));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession({
    req,
    ...authOptions,
  });
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const newTeam = await prismaClientDefault.team.create({
    data: {
      name,
      members: {
        create: {
          userId: session.user.id as string,
          role: "OWNER",
        },
      },
    },
  });

  return NextResponse.json(newTeam, { status: 201 });
}
