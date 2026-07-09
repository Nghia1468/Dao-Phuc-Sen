import { NextResponse } from "next/server";
import { categories } from "@/lib/data";
import { getProductsByCategory } from "@/lib/catalog";

export const revalidate = 60;

export interface MegaMenuCategory {
  slug: string;
  name: string;
  image: string;
  products: { id: string; name: string; image: string; price: number; salePrice?: number }[];
}

export async function GET() {
  try {
    const data: MegaMenuCategory[] = await Promise.all(
      categories.map(async (c) => {
        const products = await getProductsByCategory(c.slug);
        return {
          slug: c.slug,
          name: c.name,
          image: c.image,
          products: products.slice(0, 4).map((p) => ({
            id: p.id,
            name: p.name,
            image: p.images[0],
            price: p.price,
            salePrice: p.salePrice,
          })),
        };
      })
    );

    return NextResponse.json({ categories: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}
