import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readVouchers,
  createVoucher,
  isSheetsConfigured,
  type SheetVoucher,
} from "@/lib/googleSheets";
import { invalidateVoucherCache } from "@/lib/vouchers";

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
    const vouchers = await readVouchers();
    return NextResponse.json({ vouchers });
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
    const body = (await req.json()) as Omit<SheetVoucher, "rowNumber">;
    if (!body.code?.trim()) {
      return NextResponse.json({ error: "Thiếu mã giảm giá." }, { status: 400 });
    }
    await createVoucher(body);
    invalidateVoucherCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
