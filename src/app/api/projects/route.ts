import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { withErrorHandling } from "../../../lib/api-utils";

export const GET = withErrorHandling(async () => {
  const projects = await db.project.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(projects, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
});

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const { id, ...data } = body;

  if (id) {
    const project = await db.project.update({
      where: { id },
      data,
    });
    return NextResponse.json(project);
  }

  const project = await db.project.create({
    data,
  });
  return NextResponse.json(project);
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
