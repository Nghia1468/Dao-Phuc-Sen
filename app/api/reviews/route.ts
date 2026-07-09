import { NextRequest, NextResponse } from "next/server";
import { submitReview } from "@/lib/reviews";
import { uploadProductImage, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const { productId, author, rating, comment, image } = (await req.json()) as {
      productId?: string;
      author?: string;
      rating?: number;
      comment?: string;
      image?: string;
    };

    if (!productId || !author?.trim() || !comment?.trim() || !rating) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên, số sao và nội dung đánh giá." },
        { status: 400 }
      );
    }

    // Ảnh khách gửi lên là base64 data URL (rất dài, có thể vượt quá giới hạn
    // 50.000 ký tự/ô của Google Sheets) — luôn upload lên Cloudinary trước để
    // chỉ lưu 1 URL ngắn vào Sheet. Nếu chưa cấu hình Cloudinary hoặc upload
    // lỗi, bỏ qua ảnh và vẫn cho gửi đánh giá bằng chữ (không chặn khách hàng).
    let imageUrl: string | undefined;
    if (image && image.startsWith("data:image/")) {
      if (isCloudinaryConfigured()) {
        try {
          imageUrl = await uploadProductImage(image, "dao-phuc-sen/reviews");
        } catch (err) {
          console.error("[reviews] Upload ảnh đánh giá thất bại:", err);
        }
      }
    } else if (image && !image.startsWith("data:")) {
      // Đã là URL sẵn (không phải base64) — dùng luôn.
      imageUrl = image;
    }

    await submitReview({
      productId,
      author: author.trim(),
      rating,
      comment: comment.trim(),
      image: imageUrl,
    });

    return NextResponse.json({
      ok: true,
      message:
        image && !imageUrl
          ? "Cảm ơn bạn! Đánh giá sẽ hiển thị sau khi được duyệt (ảnh không được đính kèm do lỗi tải lên)."
          : "Cảm ơn bạn! Đánh giá sẽ hiển thị sau khi được duyệt.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Không gửi được đánh giá." },
      { status: 500 }
    );
  }
}
