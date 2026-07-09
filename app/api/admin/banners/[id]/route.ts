import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readBanners,
  updateBannerRow,
  deleteBannerRow,
  isSheetsConfigured,
  type SheetBanner,
} from "@/lib/googleSheets";

async function findBannerRow(id: string) {
  const banners = await readBanners();
  return banners.find((b) => b.id === id);
}

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
    const existing = await findBannerRow(id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy banner." }, { status: 404 });
    }
    const body = (await req.json()) as Omit<SheetBanner, "rowNumber">;

    // Nếu banner này được chọn làm banner chính, bỏ cờ "chính" ở các banner khác.
    if (body.isMain) {
      const all = await readBanners();
      await Promise.all(
        all
          .filter((b) => b.id !== id && b.isMain)
          .map((b) =>
            updateBannerRow(b.rowNumber, { ...b, isMain: false })
          )
      );
    }

    await updateBannerRow(existing.rowNumber, body);
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
    const existing = await findBannerRow(id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy banner." }, { status: 404 });
    }
    await deleteBannerRow(existing.rowNumber);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
