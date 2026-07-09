import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { readOrders, isSheetsConfigured } from "@/lib/googleSheets";

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
    const orders = await readOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
