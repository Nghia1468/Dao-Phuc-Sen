import { NextRequest, NextResponse } from "next/server";
import { appendOrder, type OrderInput } from "@/lib/googleSheets";

export interface PlaceOrderPayload {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  ward: string;
  note: string;
  paymentMethod: string;
  voucherCode: string;
  shippingFee: number;
  items: { name: string; quantity: number; price: number }[];
}

function generateOrderId(): string {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 12);
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `DH${stamp}${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PlaceOrderPayload;

    if (!body.fullName || !body.phone || !body.address || !body.items?.length) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc (họ tên, SĐT, địa chỉ, sản phẩm)." },
        { status: 400 }
      );
    }

    const subtotal = body.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const quantity = body.items.reduce((s, i) => s + i.quantity, 0);
    const total = Math.max(0, subtotal + (body.shippingFee || 0));
    const orderId = generateOrderId();

    const order: OrderInput = {
      orderId,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email ?? "",
      address: body.address,
      province: body.province ?? "",
      ward: body.ward ?? "",
      productsSummary: body.items
        .map((i) => `${i.name} x${i.quantity}`)
        .join(", "),
      quantity,
      subtotal,
      voucherCode: body.voucherCode ?? "",
      shippingFee: body.shippingFee || 0,
      total,
      paymentMethod: body.paymentMethod ?? "COD",
      status: "Chờ xác nhận",
      note: body.note ?? "",
    };

    await appendOrder(order);

    return NextResponse.json({ orderId, total });
  } catch (err) {
    console.error("Lỗi khi ghi đơn hàng vào Google Sheets:", err);
    const message =
      err instanceof Error ? err.message : "Đã có lỗi xảy ra, vui lòng thử lại.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
