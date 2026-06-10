import { NextResponse } from 'next/server'
import { withErrorHandling } from "@/lib/api-utils";
import { storage } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from 'uuid';

// API Version: 2.0.0 - Firebase Storage Integration
export const POST = withErrorHandling(async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as string || "uploads";

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed." },
      { status: 400 }
    );
  }

  // Validate file size (max 5MB for Firebase Storage)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size exceeds 5MB limit." },
      { status: 400 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = `${folder}/${fileName}`;
    const bucket = storage.bucket();
    const fileRef = bucket.file(filePath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file public (optional, depending on bucket settings)
    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      version: "2.0.0"
    });
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to storage" },
      { status: 500 }
    );
  }
});
