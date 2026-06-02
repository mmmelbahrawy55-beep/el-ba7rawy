import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandling } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';
import { sendTelegramMessage } from '@/lib/telegram';

export const POST = withErrorHandling(async (request: Request) => {
  const limitError = rateLimit(request, 5, 300000); // 5 messages per 5 minutes per IP
  if (limitError) return limitError;

  const body = await request.json();
  const { name, phone, subject, message } = body;

  if (!name || !phone || !message) {
    return NextResponse.json(
      { error: 'جميع الحقول مطلوبة (الاسم، الهاتف، الرسالة)' },
      { status: 400 }
    );
  }

  const newMessage = await db.message.create({
    data: {
      name,
      phone,
      subject: subject || 'بدون موضوع',
      message,
    },
  });

  // Send Telegram Notification
  try {
    const telegramMsg = `
<b>📩 رسالة جديدة من الموقع!</b>
------------------------
<b>👤 الاسم:</b> ${name}
<b>📞 الهاتف:</b> ${phone}
<b>🏷️ الموضوع:</b> ${subject || 'بدون موضوع'}
<b>📝 الرسالة:</b>
${message}
------------------------
<i>يرجى مراجعة لوحة التحكم للرد.</i>
    `;
    await sendTelegramMessage(telegramMsg);
  } catch (err) {
    console.error("Error sending message notification:", err);
  }

  // AI Auto-Reply logic
  const marketingConfig = await db.marketingAIConfig.findUnique({
    where: { id: 'marketing-ai-config' }
  });

  if (marketingConfig?.isEnabled && marketingConfig?.autoReply) {
    // In a real app, this would send an SMS or WhatsApp message via API
    // For now, we simulate the AI processing and logging the action
    await db.activityLog.create({
      data: {
        action: 'AI_AUTO_REPLY',
        details: `تم الرد تلقائياً على رسالة من ${name} بخصوص ${subject || 'بدون موضوع'}`,
        userId: 'marketing-ai-bot'
      }
    });
  }

  return NextResponse.json(
    { success: true, message: 'تم إرسال رسالتك بنجاح', data: newMessage },
    { status: 201 }
  );
});
