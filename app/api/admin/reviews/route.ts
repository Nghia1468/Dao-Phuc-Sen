import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { isSheetsConfigured } from "@/lib/googleSheets";
import { getAllReviewsForAdmin } from "@/lib/reviews";

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
    const reviews = await getAllReviewsForAdmin();
    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
