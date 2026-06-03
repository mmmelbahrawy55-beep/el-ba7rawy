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
    console.log("Saving settings with body:", body);

    const updated = await db.setting.upsert({
      where: { id: "site-settings" },
      update: {
        siteName: body.siteName,
        siteNameEn: body.siteNameEn,
        logoUrl: body.logoUrl,
        whatsapp: body.whatsapp,
        email: body.email,
        address: body.address,
        facebook: body.facebook,
        instagram: body.instagram,
      },
      create: {
        id: "site-settings",
        siteName: body.siteName,
        siteNameEn: body.siteNameEn,
        logoUrl: body.logoUrl,
        whatsapp: body.whatsapp,
        email: body.email,
        address: body.address,
        facebook: body.facebook,
        instagram: body.instagram,
      },
    });

    // Update Gemini Key in AI Config if provided
    if (body.geminiKey !== undefined) {
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
    }

    return NextResponse.json({
      ...updated,
      geminiKey: body.geminiKey,
    });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
