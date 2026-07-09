import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readPosts,
  updatePostRow,
  deletePostRow,
  isSheetsConfigured,
  type SheetPost,
} from "@/lib/googleSheets";
import { invalidateBlogCache } from "@/lib/blog";

async function findPostRow(slug: string) {
  const posts = await readPosts();
  return posts.find((p) => p.slug === slug);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSheetsConfigured()) {
    return NextResponse.json(
      { error: "Chưa cấu hình Google Sheets — xem GOOGLE_SHEETS_SETUP.md" },
      { status: 400 }
    );
  }
  const { slug } = await params;
  try {
    const existing = await findPostRow(slug);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }
    const body = (await req.json()) as Omit<SheetPost, "rowNumber">;
    await updatePostRow(existing.rowNumber, body);
    invalidateBlogCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSheetsConfigured()) {
    return NextResponse.json(
      { error: "Chưa cấu hình Google Sheets — xem GOOGLE_SHEETS_SETUP.md" },
      { status: 400 }
    );
  }
  const { slug } = await params;
  try {
    const existing = await findPostRow(slug);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }
    await deletePostRow(existing.rowNumber);
    invalidateBlogCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
