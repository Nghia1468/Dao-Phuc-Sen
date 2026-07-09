import { NextRequest, NextResponse } from "next/server";
import { getVouchersWithUsability } from "@/lib/vouchers";

export async function POST(req: NextRequest) {
  try {
    const { subtotal, appliedCodes } = (await req.json()) as {
      subtotal?: number;
      appliedCodes?: string[];
    };

    const result = await getVouchersWithUsability(
      typeof subtotal === "number" ? subtotal : 0,
      appliedCodes ?? []
    );

    return NextResponse.json({ vouchers: result });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Không tải được danh sách mã giảm giá.",
      },
      { status: 500 }
    );
  }
}
