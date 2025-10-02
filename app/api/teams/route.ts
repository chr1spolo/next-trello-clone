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
    where: { userId, accepted: true },
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

  const { name, members } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }


  const filterMembers = (
    members as Array<{ email: string; role: string }>
  ).filter((member) => member.email !== session.user?.email);

  let responseText: string = "";
  const newMembersAdded: {
    id: string;
    role: string;
  }[] = [];

  if (filterMembers.length > 0) {
    const existingUsers = await prismaClientDefault.user.findMany({
      where: {
        email: {
          in: filterMembers.map((m) => m.email),
        },
      },
    });

    filterMembers.forEach((member) => {
      const user = existingUsers.find((u) => u.email === member.email);
      if (user) {
        newMembersAdded.push({
          id: user.id,
          role: member.role,
        });
      } else {
        // saltos de linea al final
        responseText += `El usuario con email ${member.email} no existe. \n`;
      }
    });
  }

  const newTeam = await prismaClientDefault.team.create({
    data: {
      name,
      members: {
        createMany: {
          data: [
            { userId: session.user.id, role: "OWNER", accepted: true, joinedAt: new Date() },
            ...newMembersAdded.map((member) => ({
              userId: member.id,
              role: member.role,
            })),
          ],
        },
      },
    },
  });

  const response = {
    ...newTeam,
    message: responseText.trim(),
  };

  return NextResponse.json(response, { status: 201 });
}
