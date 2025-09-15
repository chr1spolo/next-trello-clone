import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  authOptions,
  prismaClientDefault as prisma,
} from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
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

  const { status } = await req.json();

  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
