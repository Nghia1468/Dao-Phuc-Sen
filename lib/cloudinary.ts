// ---------------------------------------------------------------------------
// Cloudinary — dùng để upload ảnh sản phẩm trực tiếp từ trang Admin, thay vì
// phải tự tìm link ảnh rồi dán URL.
//
// Cần khai báo trong .env.local:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
//
// File này chỉ chạy ở server (Route Handler) — không import từ "use client".
// ---------------------------------------------------------------------------

import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload 1 ảnh (dạng base64 data URL, ví dụ "data:image/png;base64,....")
 * lên Cloudinary. Trả về URL công khai. `folder` mặc định dùng cho ảnh sản
 * phẩm/banner (Admin); truyền `folder` khác (vd "dao-phuc-sen/reviews") cho
 * ảnh khách hàng tự upload kèm đánh giá.
 */
export async function uploadProductImage(
  dataUrl: string,
  folder = "dao-phuc-sen/products"
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Chưa cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) trong .env.local"
    );
  }
  configure();
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
}
