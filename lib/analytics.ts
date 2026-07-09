import { isSheetsConfigured, readProductViews, type ProductViewRow } from "./googleSheets";

export interface ViewStats {
  configured: boolean;
  totalViews: number;
  topProducts: { productId: string; productName: string; category: string; count: number }[];
  recentViews: ProductViewRow[];
}

const EMPTY_STATS: ViewStats = {
  configured: false,
  totalViews: 0,
  topProducts: [],
  recentViews: [],
};

export async function getViewStats(): Promise<ViewStats> {
  if (!isSheetsConfigured()) return EMPTY_STATS;

  try {
    const views = await readProductViews(1000);

    const grouped = new Map<
      string,
      { productId: string; productName: string; category: string; count: number }
    >();
    for (const v of views) {
      const existing = grouped.get(v.productId);
      if (existing) {
        existing.count += 1;
      } else {
        grouped.set(v.productId, {
          productId: v.productId,
          productName: v.productName,
          category: v.category,
          count: 1,
        });
      }
    }

    const topProducts = Array.from(grouped.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      configured: true,
      totalViews: views.length,
      topProducts,
      recentViews: views.slice(0, 30),
    };
  } catch (err) {
    console.error("[analytics] Không đọc được lượt xem:", err);
    return { ...EMPTY_STATS, configured: true };
  }
}
