import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { sendTelegramMessage } from "../../../lib/telegram";
import { withErrorHandling } from "../../../lib/api-utils";

export const GET = withErrorHandling(async () => {
  const orders = await db.order.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
});

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();

    const {
      customerName,
      phone,
      productId,
      productName,
      categoryName,
      quantity,
      size,
      details,
      estimatedPrice,
      deliveryDays,
    } = body as {
      customerName: string;
      phone: string;
      productId?: string | null;
      productName: string;
      categoryName: string;
      quantity?: string | null;
      size?: string | null;
      details?: string | null;
      estimatedPrice?: number | null;
      deliveryDays?: number;
    };

    if (!customerName || !phone || !productName || !categoryName) {
      return NextResponse.json(
        { error: "Missing required fields: customerName, phone, productName, categoryName" },
        { status: 400 }
      );
    }

    const order = await db.order.create({
      data: {
        customerName,
        phone,
        productId: productId ?? null,
        productName,
        categoryName,
        quantity: quantity ?? null,
        size: size ?? null,
        details: details ?? null,
        estimatedPrice: estimatedPrice ?? null,
        deliveryDays: deliveryDays ?? 3,
        status: "pending",
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    // Send Telegram Notification
    try {
      const telegramMsg = `
<b>🔔 طلب جديد من الموقع!</b>
------------------------
<b>👤 العميل:</b> ${customerName}
<b>📞 الهاتف:</b> ${phone}
<b>📦 المنتج:</b> ${productName}
<b>📂 القسم:</b> ${categoryName}
<b>🔢 الكمية:</b> ${quantity || "غير محدد"}
<b>📏 المقاس:</b> ${size || "غير محدد"}
<b>💰 السعر التقريبي:</b> ${estimatedPrice ? `${estimatedPrice} ج.م` : "سيتم التحديد"}
<b>📝 التفاصيل:</b> ${details || "لا توجد"}
------------------------
<i>يرجى مراجعة لوحة التحكم للتفاصيل.</i>
      `;
      await sendTelegramMessage(telegramMsg);
    } catch (err) {
      console.error("Error sending order notification:", err);
    }

    return NextResponse.json(order, { status: 201 });
});

export const PATCH = withErrorHandling(async (request: Request) => {
  const body = await request.json();

  const { id, status } = body as {
    id: string;
    status: string;
  };

  if (!id || !status) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 400 }
    );
  }

  const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id },
    data: { status },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  return NextResponse.json(order);
});
