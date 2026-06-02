import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const clients = await db.client.findMany({
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        orders: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch clients";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, productName, paidAmount, remainingAmount } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const client = await db.$transaction(async (tx) => {
      const c = await tx.client.create({
        data: {
          name,
          phone,
          totalPaid: parseFloat(paidAmount) || 0,
          totalDebt: parseFloat(remainingAmount) || 0,
          status: 'active'
        },
      });

      // Create initial order if product name exists
      if (productName) {
        await tx.order.create({
          data: {
            clientId: c.id,
            customerName: name,
            phone: phone,
            productName: productName,
            categoryName: 'عام',
            status: 'pending',
            estimatedPrice: (parseFloat(paidAmount) || 0) + (parseFloat(remainingAmount) || 0)
          }
        });
      }

      // Create initial transaction if paid amount exists
      if (parseFloat(paidAmount) > 0) {
        await tx.transaction.create({
          data: {
            clientId: c.id,
            type: 'payment',
            amount: parseFloat(paidAmount),
            description: `دفعة مقدمة لطلب ${productName || 'جديد'}`,
            status: 'completed'
          }
        });
      }

      // Create initial debt transaction if remaining amount exists
      if (parseFloat(remainingAmount) > 0) {
        await tx.transaction.create({
          data: {
            clientId: c.id,
            type: 'debt',
            amount: parseFloat(remainingAmount),
            description: `متبقي من حساب ${productName || 'الطلب'}`,
            status: 'pending'
          }
        });
      }

      return c;
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    const message = error instanceof Error ? error.message : "Failed to create client";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
