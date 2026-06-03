import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    let setting = await db.setting.findUnique({
      where: { id: "site-settings" },
    });

    if (!setting) {
      setting = await db.setting.create({
        data: {
          id: "site-settings",
          siteName: "ELBA7RAWY",
        },
      });
    }

    // Fetch AI config for Gemini Key
    const aiConfig = await db.marketingAIConfig.findUnique({
      where: { id: "marketing-ai-config" },
    });

    return NextResponse.json({
      ...setting,
      geminiKey: aiConfig?.keywords || null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("Saving settings with body size:", JSON.stringify(body).length);

    // Validate body size for Prisma/Postgres limits (Base64 can be large)
    // Reducing limit slightly to be safer with database string limits
    if (JSON.stringify(body).length > 2 * 1024 * 1024) { // 2MB limit
      return NextResponse.json({ 
        error: "حجم البيانات كبير جداً", 
        details: "الرجاء اختيار صورة شعار أصغر حجماً (أقل من 1 ميجا)" 
      }, { status: 413 });
    }

    const dataToUpdate = {
      siteName: body.siteName || "البحراوي للدعاية والإعلان",
      siteNameEn: body.siteNameEn || "El Bahrawy Advertising",
      logoUrl: body.logoUrl || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      address: body.address || null,
      facebook: body.facebook || null,
      instagram: body.instagram || null,
    };

    console.log("Upserting settings with ID: site-settings");
    const updated = await db.setting.upsert({
      where: { id: "site-settings" },
      update: dataToUpdate,
      create: {
        id: "site-settings",
        ...dataToUpdate,
      },
    });
    console.log("Settings upserted successfully");

    // Update Gemini Key in AI Config if provided
    if (body.geminiKey !== undefined) {
      try {
        await db.marketingAIConfig.upsert({
          where: { id: "marketing-ai-config" },
          update: {
            keywords: body.geminiKey,
            isEnabled: !!body.geminiKey,
          },
          create: {
            id: "marketing-ai-config",
            keywords: body.geminiKey,
            isEnabled: !!body.geminiKey,
          },
        });
      } catch (aiError) {
        console.error("AI Config Update Error (Non-blocking):", aiError);
        // We don't block settings update if AI config fails
      }
    }

    return NextResponse.json({
      ...updated,
      geminiKey: body.geminiKey,
    });
  } catch (error: any) {
    console.error("Settings Update Error:", error);
    const errorMessage = error?.message || "Internal Database Error";
    return NextResponse.json({ 
      error: "فشل في تحديث قاعدة البيانات", 
      details: errorMessage,
      code: error?.code 
    }, { status: 500 });
  }
}
