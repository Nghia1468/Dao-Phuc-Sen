import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { uploadProductImage, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Chưa cấu hình Cloudinary — điền CLOUDINARY_API_SECRET trong .env.local",
      },
      { status: 400 }
    );
  }

  try {
    const { dataUrl } = (await req.json()) as { dataUrl?: string };
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Thiếu ảnh hoặc định dạng ảnh không hợp lệ." },
        { status: 400 }
      );
    }
    const url = await uploadProductImage(dataUrl);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload ảnh thất bại." },
      { status: 500 }
    );
  }
}
