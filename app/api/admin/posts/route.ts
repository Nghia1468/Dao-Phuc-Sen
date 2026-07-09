import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readPosts,
  createPost,
  isSheetsConfigured,
  type SheetPost,
} from "@/lib/googleSheets";
import { invalidateBlogCache } from "@/lib/blog";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSheetsConfigured()) {
    return NextResponse.json(
      { error: "Chưa cấu hình Google Sheets — xem GOOGLE_SHEETS_SETUP.md" },
      { status: 400 }
    );
  }
  try {
    const posts = await readPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSheetsConfigured()) {
    return NextResponse.json(
      { error: "Chưa cấu hình Google Sheets — xem GOOGLE_SHEETS_SETUP.md" },
      { status: 400 }
    );
  }
  try {
    const body = (await req.json()) as Omit<SheetPost, "rowNumber">;
    if (!body.slug?.trim() || !body.title?.trim()) {
      return NextResponse.json({ error: "Thiếu Slug hoặc Tiêu đề." }, { status: 400 });
    }
    await createPost(body);
    invalidateBlogCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
