import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readOrders,
  updateOrderStatus,
  isSheetsConfigured,
  ORDER_STATUSES,
} from "@/lib/googleSheets";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
  const { id } = await params;
  try {
    const body = (await req.json()) as { status: string; note?: string };
    if (!ORDER_STATUSES.includes(body.status as (typeof ORDER_STATUSES)[number])) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
    }
    const orders = await readOrders();
    const existing = orders.find((o) => o.orderId === id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
    }
    await updateOrderStatus(existing.rowNumber, body.status, body.note ?? existing.note);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
