import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getExpectedAdminToken } from "@/lib/admin-constants";

export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password?: string };
  const expected = getExpectedAdminToken();

  if (!password || password !== expected) {
    return NextResponse.json({ error: "Sai mật khẩu." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 giờ
  });
  return res;
}
