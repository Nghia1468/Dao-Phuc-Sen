import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const products = await searchProducts(q);
  return NextResponse.json({ products });
}
