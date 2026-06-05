import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const orders = await db.order.findMany({
    where: { phone: phone },
    include: {
      product: {
        select: {
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
});
