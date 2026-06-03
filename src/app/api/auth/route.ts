import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

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
      // Mock user for when database is not ready or fails
      const mockUser = {
        id: "admin-1",
        email: ADMIN_EMAIL,
        name: "البحراوي 1",
        role: "admin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin1",
      };

      try {
        // Try database operation but don't crash if it fails
        const user = await db.user.upsert({
          where: { email: ADMIN_EMAIL },
          update: {},
          create: {
            email: ADMIN_EMAIL,
            name: "محمد البحراوي",
            role: "admin",
          }
        });
        
        Object.assign(mockUser, user);

        await db.activityLog.create({
          data: {
            action: 'ADMIN_LOGIN',
            details: `تسجيل دخول المسؤول: ${mockUser.name}`,
            userEmail: mockUser.email,
            userId: mockUser.id
          }
        }).catch((e: any) => console.error("Activity log failed", e));
      } catch (dbError) {
        console.error("Database auth failed, using mock:", dbError);
      }

      const token = Buffer.from(JSON.stringify({
        userId: mockUser.id,
        role: "admin",
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })).toString("base64");

      const response = NextResponse.json({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatar: mockUser.avatar,
        token,
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
