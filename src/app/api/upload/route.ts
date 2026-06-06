import { NextResponse } from 'next/server'
import { withErrorHandling } from "@/lib/api-utils";

// API Version: 1.1.0 - Base64 Only to support Vercel EROFS
export const POST = withErrorHandling(async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

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

  // Validate file size (max 2MB for Base64 to avoid DB/Payload issues)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size exceeds 2MB limit for Vercel uploads." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Convert to Base64 to support Vercel (Read-only filesystem)
  // This bypasses the need for disk access (EROFS)
  const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

  return NextResponse.json({
    url: base64Image,
    filename: file.name,
    size: file.size,
    type: file.type,
    version: "1.1.0"
  });
});
