import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize folder name
    const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase();

    // Create uploads directory with subfolder
    const uploadsDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.name) || ".png";
    const filename = `${uniqueSuffix}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/${safeFolder}/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
