import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Use environment variables for production security
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@elbahrawy.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123456";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, provider } = body as { email?: string; password?: string; provider?: string };

    // Google Login Logic (Mock for now, can be integrated with NextAuth or Supabase)
    if (provider === 'google') {
      // In a real scenario, we would verify the google token here
      return NextResponse.json({ 
        id: 'google-client',
        email: 'client@gmail.com',
        name: 'عميل جوجل',
        role: 'client'
      });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Find or create admin user in database for activity logging
      let user = await db.user.findUnique({
        where: { email: ADMIN_EMAIL }
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email: ADMIN_EMAIL,
            name: "محمد البحراوي",
            role: "admin",
          }
        });
      }

      const token = Buffer.from(JSON.stringify({
        userId: user.id,
        role: "admin",
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })).toString("base64");

      const response = NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        token,
      });

      // Log the login event
      await db.activityLog.create({
        data: {
          action: 'ADMIN_LOGIN',
          details: `تسجيل دخول المسؤول: ${user.name}`,
          userEmail: user.email,
          userId: user.id
        }
      });

      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
