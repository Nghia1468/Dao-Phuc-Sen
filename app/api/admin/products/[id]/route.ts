import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  readProducts,
  updateProductRow,
  deleteProductRow,
  isSheetsConfigured,
  type SheetProduct,
} from "@/lib/googleSheets";
import { invalidateCatalogCache } from "@/lib/catalog";

async function findProductRow(id: string) {
  const products = await readProducts();
  return products.find((p) => p.id === id);
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
    const existing = await findProductRow(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm trong Sheet." },
        { status: 404 }
      );
    }
    const body = (await req.json()) as Omit<SheetProduct, "rowNumber">;
    await updateProductRow(existing.rowNumber, body);
    invalidateCatalogCache();
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
    const existing = await findProductRow(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm trong Sheet." },
        { status: 404 }
      );
    }
    await deleteProductRow(existing.rowNumber);
    invalidateCatalogCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
