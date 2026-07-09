// File nhỏ, không import gì "nặng" (không googleapis, không next/headers) để
// middleware.ts (chạy trên Edge Runtime) có thể import an toàn.

export const ADMIN_COOKIE_NAME = "mai_admin_session";

export function getExpectedAdminToken(): string {
  // Đổi mật khẩu thật trong .env.local (biến ADMIN_PASSWORD).
  return process.env.ADMIN_PASSWORD ?? "admin123";
}
