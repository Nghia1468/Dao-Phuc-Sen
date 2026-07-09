import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, getExpectedAdminToken } from "./admin-constants";

/** Dùng trong Route Handler (app/api/**) để kiểm tra đã đăng nhập Admin chưa. */
export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  return token === getExpectedAdminToken();
}
