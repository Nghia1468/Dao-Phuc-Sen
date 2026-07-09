import { NextRequest, NextResponse } from "next/server";
import { isSheetsConfigured, trackProductView } from "@/lib/googleSheets";

export async function POST(req: NextRequest) {
  try {
    if (!isSheetsConfigured()) {
      // Chưa cấu hình Sheets — bỏ qua lặng lẽ, không báo lỗi cho khách.
      return NextResponse.json({ ok: true, tracked: false });
    }

    const { productId, productName, category } = (await req.json()) as {
      productId?: string;
      productName?: string;
      category?: string;
    };

    if (!productId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await trackProductView({
      productId,
      productName: productName ?? "",
      category: category ?? "",
    });

    return NextResponse.json({ ok: true, tracked: true });
  } catch (err) {
    console.error("[track-view] Lỗi:", err);
    // Không để lỗi tracking ảnh hưởng đến trải nghiệm khách hàng.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
