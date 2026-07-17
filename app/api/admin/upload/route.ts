import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  uploadProductImage,
  uploadProductVideo,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

// Video sản phẩm thường vài MB đến vài chục MB — giới hạn 80MB để tránh
// request quá nặng / vượt gói Cloudinary miễn phí.
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

function estimateBase64Bytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

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
    const { dataUrl, type } = (await req.json()) as {
      dataUrl?: string;
      type?: "image" | "video";
    };

    if (type === "video") {
      if (!dataUrl || !dataUrl.startsWith("data:video/")) {
        return NextResponse.json(
          { error: "Thiếu video hoặc định dạng video không hợp lệ." },
          { status: 400 }
        );
      }
      if (estimateBase64Bytes(dataUrl) > MAX_VIDEO_BYTES) {
        return NextResponse.json(
          { error: "Video quá lớn — vui lòng chọn video dưới 80MB." },
          { status: 400 }
        );
      }
      const url = await uploadProductVideo(dataUrl);
      return NextResponse.json({ url });
    }

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
      { error: err instanceof Error ? err.message : "Tải tệp lên thất bại." },
      { status: 500 }
    );
  }
}
