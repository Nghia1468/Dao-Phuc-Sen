import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readReviews,
  updateReviewRow,
  deleteReviewRow,
  isSheetsConfigured,
} from "@/lib/googleSheets";
import { invalidateReviewCache } from "@/lib/reviews";

async function findReviewRow(id: string) {
  const reviews = await readReviews();
  return reviews.find((r) => r.id === id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Chưa cấu hình Google Sheets." }, { status: 400 });
  }
  const { id } = await params;
  try {
    const existing = await findReviewRow(id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy đánh giá." }, { status: 404 });
    }
    const { approved } = (await req.json()) as { approved: boolean };
    const { rowNumber, ...rest } = existing;
    void rowNumber;
    await updateReviewRow(existing.rowNumber, { ...rest, approved });
    invalidateReviewCache();
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
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Chưa cấu hình Google Sheets." }, { status: 400 });
  }
  const { id } = await params;
  try {
    const existing = await findReviewRow(id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy đánh giá." }, { status: 404 });
    }
    await deleteReviewRow(existing.rowNumber);
    invalidateReviewCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
