import { NextRequest, NextResponse } from "next/server";
import { validateVoucher } from "@/lib/vouchers";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal, appliedCodes } = (await req.json()) as {
      code?: string;
      subtotal?: number;
      appliedCodes?: string[];
    };

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json(
        { ok: false, error: "Thiếu mã giảm giá hoặc tổng tiền đơn hàng." },
        { status: 400 }
      );
    }

    const result = await validateVoucher(code, subtotal, appliedCodes ?? []);
    if (!result.ok) {
      return NextResponse.json(result, { status: 200 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : "Không kiểm tra được mã giảm giá.",
      },
      { status: 500 }
    );
  }
}
