import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandling } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, type, amount, description, status } = body;

    if (!clientId || !type || !amount || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the transaction
    const transaction = await db.transaction.create({
      data: {
        clientId,
        type,
        amount: parseFloat(amount),
        description,
        status: status || "completed",
      },
    });

    // Update client totals
    const client = await db.client.findUnique({
      where: { id: clientId },
    });

    if (client) {
      let totalPaid = client.totalPaid;
      let totalDebt = client.totalDebt;

      if (type === "payment") {
        totalPaid += parseFloat(amount);
        totalDebt = Math.max(0, totalDebt - parseFloat(amount));
      } else if (type === "debt") {
        totalDebt += parseFloat(amount);
      }

      await db.client.update({
        where: { id: clientId },
        data: {
          totalPaid,
          totalDebt,
          lastActivity: new Date(),
        },
      });
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
