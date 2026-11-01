import { NextRequest, NextResponse } from "next/server";

// In-memory session store for mobile-to-desktop camera transfers
// Map session ID -> { imageBase64, filename, name, uploadedAt }
const sessions = new Map<string, { imageBase64: string; filename: string; name: string; uploadedAt: number }>();

// Periodic cleanup of sessions older than 30 minutes
setInterval(() => {
  const now = Date.now();
  sessions.forEach((data, id) => {
    if (now - data.uploadedAt > 30 * 60 * 1000) {
      sessions.delete(id);
    }
  });
}, 60 * 1000);

// GET /api/mobile-sync?session=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = searchParams.get("session");

  if (!session) {
    return NextResponse.json({ error: "Missing session parameter" }, { status: 400 });
  }

  const data = sessions.get(session);
  if (!data) {
    return NextResponse.json({ uploaded: false });
  }

  return NextResponse.json({
    uploaded: true,
    imageBase64: data.imageBase64,
    filename: data.filename,
    name: data.name,
    uploadedAt: data.uploadedAt,
  });
}

// POST /api/mobile-sync
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let session = "";
    let imageBase64 = "";
    let filename = "phone_photo.jpg";
    let name = "Mobile Photo";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      session = (formData.get("session") as string) || "";
      name = (formData.get("name") as string) || "Mobile Camera Photo";

      const file = formData.get("image") as File;
      if (!file) {
        return NextResponse.json({ error: "Missing image file" }, { status: 400 });
      }
      filename = file.name || "mobile_capture.jpg";
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || "image/jpeg";
      imageBase64 = `data:${mime};base64,${buffer.toString("base64")}`;
    } else {
      const body = await req.json();
      session = body.session || "";
      imageBase64 = body.imageBase64 || "";
      filename = body.filename || "phone_photo.jpg";
      name = body.name || "Mobile Photo";
    }

    if (!session || !imageBase64) {
      return NextResponse.json({ error: "Session and image are required" }, { status: 400 });
    }

    sessions.set(session, {
      imageBase64,
      filename,
      name,
      uploadedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Photo uploaded and sent to desktop studio!",
      session,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}
