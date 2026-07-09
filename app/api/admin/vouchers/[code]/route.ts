import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readVouchers,
  updateVoucherRow,
  deleteVoucherRow,
  isSheetsConfigured,
  type SheetVoucher,
} from "@/lib/googleSheets";
import { invalidateVoucherCache } from "@/lib/vouchers";

async function findVoucherRow(code: string) {
  const vouchers = await readVouchers();
  return vouchers.find((v) => v.code.toUpperCase() === code.toUpperCase());
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
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
  const { code } = await params;
  try {
    const existing = await findVoucherRow(code);
    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy mã giảm giá trong Sheet." },
        { status: 404 }
      );
    }
    const body = (await req.json()) as Omit<SheetVoucher, "rowNumber">;
    await updateVoucherRow(existing.rowNumber, body);
    invalidateVoucherCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
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
  const { code } = await params;
  try {
    const existing = await findVoucherRow(code);
    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy mã giảm giá trong Sheet." },
        { status: 404 }
      );
    }
    await deleteVoucherRow(existing.rowNumber);
    invalidateVoucherCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
