import { NextResponse } from "next/server";
import { db, auth, storage } from "@/lib/server/firebase-admin";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      NODE_ENV: process.env.NODE_ENV,
    },
    firebase: {
      db_initialized: !!db,
      auth_initialized: !!auth,
      storage_initialized: !!storage,
    },
    errors: []
  };

  try {
    if (db) {
      const snapshot = await db.collection('Category').limit(1).get();
      diagnostics.firestore = {
        status: "connected",
        count: snapshot.size,
        readable: true
      };
    } else {
      diagnostics.firestore = { status: "not_initialized" };
    }
  } catch (e: any) {
    diagnostics.firestore = { status: "error" };
    diagnostics.errors.push(`Firestore Error: ${e.message}`);
  }

  return NextResponse.json(diagnostics);
}
