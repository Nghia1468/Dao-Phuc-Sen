import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { isSheetsConfigured, readReviews } from "@/lib/googleSheets";

export const revalidate = 60; // cache 60s — đủ mới, tránh gọi Google Sheets liên tục

// ---------------------------------------------------------------------------
// Social Proof — 2 loại popup xen kẽ:
//  1) "purchase": tên khách (ngẫu nhiên) vừa mua sản phẩm THẬT lấy từ catalog.
//  2) "review"  : đánh giá THẬT đã duyệt từ Sheet "Reviews" — nếu chưa có dữ
//     liệu, dùng dữ liệu mẫu (fallback) để không hiện popup trống.
// Không lộ thông tin khách hàng thật (không đọc Sheet "Orders") — tên khách
// mua hàng lấy từ danh sách tên phổ biến, ngẫu nhiên hoá theo yêu cầu.
// ---------------------------------------------------------------------------

const SAMPLE_NAMES = [
  "Anh Tuấn", "Chị Hương", "Anh Long", "Chị Lan", "Anh Đức", "Chị Mai",
  "Anh Hùng", "Chị Thảo", "Anh Nam", "Chị Linh", "Anh Sơn", "Chị Ngọc",
  "Anh Phong", "Chị Trang", "Anh Khánh", "Chị Hoa", "Anh Minh", "Chị Yến",
];

const SAMPLE_LOCATIONS = ["Hà Nội", "TP.HCM", "Cao Bằng", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];

interface PurchaseNotification {
  type: "purchase";
  id: string;
  customerName: string;
  location: string;
  productName: string;
  productImage: string | null;
  productId: string;
  quantity: number;
  minutesAgo: number;
}

interface ReviewNotification {
  type: "review";
  id: string;
  customerName: string;
  productName: string;
  productImage: string | null;
  productId: string;
  rating: number;
  comment: string;
  minutesAgo: number;
}

type Notification = PurchaseNotification | ReviewNotification;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FALLBACK_REVIEWS: Array<{ author: string; rating: number; comment: string }> = [
  { author: "Anh Kiên", rating: 5, comment: "Dao sắc, chắc tay, đúng chất rèn thủ công Phúc Sen." },
  { author: "Chị Phương", rating: 5, comment: "Giao hàng nhanh, dao chặt xương ngọt, rất hài lòng." },
  { author: "Anh Bình", rating: 4, comment: "Dao đẹp, cán cầm chắc, đóng gói cẩn thận." },
  { author: "Chị Dung", rating: 5, comment: "Mua tặng bố, ông khen dao bén và bền." },
];

export async function GET() {
  try {
    const products = await getCatalog();
    const visibleProducts = products.filter((p) => p.isVisible !== false && p.images?.[0]);

    if (visibleProducts.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    // ---- 1) Thông báo mua hàng — ghép tên ngẫu nhiên với sản phẩm thật ----
    const purchaseCount = Math.min(10, visibleProducts.length);
    const purchaseProducts = shuffle(visibleProducts).slice(0, purchaseCount);
    const purchases: PurchaseNotification[] = purchaseProducts.map((p, i) => ({
      type: "purchase",
      id: `purchase-${p.id}-${i}`,
      customerName: `${pick(SAMPLE_NAMES)} - ${pick(SAMPLE_LOCATIONS)}`,
      location: pick(SAMPLE_LOCATIONS),
      productName: p.name,
      productImage: p.images[0] ?? null,
      productId: p.id,
      quantity: Math.floor(Math.random() * 2) + 1, // 1–2
      minutesAgo: Math.floor(Math.random() * 3) + 3, // 3–5 phút trước
    }));

    // ---- 2) Đánh giá — ưu tiên dữ liệu thật đã duyệt từ Google Sheets ----
    let reviewSource: Array<{
      author: string;
      rating: number;
      comment: string;
      productId?: string;
    }> = [];

    if (isSheetsConfigured()) {
      try {
        const sheetReviews = await readReviews();
        reviewSource = sheetReviews
          .filter((r) => r.approved && r.comment)
          .map((r) => ({
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            productId: r.productId,
          }));
      } catch (err) {
        console.error("[social-proof] Không đọc được Reviews, dùng dữ liệu mẫu:", err);
      }
    }

    if (reviewSource.length === 0) {
      reviewSource = FALLBACK_REVIEWS;
    }

    const reviewCount = Math.min(10, reviewSource.length);
    const chosenReviews = shuffle(reviewSource).slice(0, reviewCount);
    const reviews: ReviewNotification[] = chosenReviews.map((r, i) => {
      const linkedProduct =
        (r.productId && visibleProducts.find((p) => p.id === r.productId)) ||
        pick(visibleProducts);
      return {
        type: "review",
        id: `review-${i}-${linkedProduct.id}`,
        customerName: r.author,
        productName: linkedProduct.name,
        productImage: linkedProduct.images[0] ?? null,
        productId: linkedProduct.id,
        rating: Math.min(5, Math.max(1, Math.round(r.rating))),
        comment: r.comment,
        minutesAgo: Math.floor(Math.random() * 20) + 5, // 5–25 phút trước
      };
    });

    // ---- Xen kẽ 2 loại — không để 2 review giống nhau đứng liền nhau ----
    const notifications: Notification[] = [];
    let pi = 0;
    let ri = 0;
    const shuffledPurchases = shuffle(purchases);
    const shuffledReviews = shuffle(reviews);
    while (pi < shuffledPurchases.length || ri < shuffledReviews.length) {
      if (pi < shuffledPurchases.length) notifications.push(shuffledPurchases[pi++]);
      if (ri < shuffledReviews.length) notifications.push(shuffledReviews[ri++]);
    }

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("[social-proof] Lỗi tổng hợp dữ liệu:", err);
    return NextResponse.json({ notifications: [] });
  }
}
