// ---------------------------------------------------------------------------
// Reviews — đánh giá khách hàng (sao, bình luận, ảnh thực tế).
// Khách gửi công khai (chưa duyệt) → Admin duyệt tại /admin/danh-gia → mới
// hiển thị công khai trên trang chi tiết sản phẩm.
// ---------------------------------------------------------------------------

import {
  isSheetsConfigured,
  readReviews as readReviewsSheet,
  createReview as createReviewSheet,
  type SheetReview,
} from "./googleSheets";

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  image?: string;
  date: string;
  approved: boolean;
}

// Vài đánh giá mẫu để trang không trống khi chưa cấu hình Google Sheets.
const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "dc-ga",
    author: "Thu Hà",
    rating: 5,
    comment: "Dao chặt gà bén ngọt, chặt gọn không bị dập xương. Đóng gói cẩn thận, giao nhanh!",
    date: "2026-06-02",
    approved: true,
  },
  {
    id: "r2",
    productId: "dc-ga",
    author: "Minh Anh",
    rating: 4,
    comment: "Cán sắt cầm chắc tay, dùng vài tháng vẫn còn bén. Đáng tiền.",
    date: "2026-06-10",
    approved: true,
  },
  {
    id: "r3",
    productId: "dt-thit",
    author: "Văn Long",
    rating: 5,
    comment: "Dao thái thịt mỏng đều tay, thái thịt sống lẫn chín đều ngọt lịm.",
    date: "2026-06-15",
    approved: true,
  },
  {
    id: "r4",
    productId: "cb-5dao",
    author: "Cô Lan (bán hàng ăn)",
    rating: 5,
    comment: "Mua combo 5 dao cho quán, đủ bộ dùng rất tiện, giá hợp lý hơn mua lẻ nhiều.",
    date: "2026-06-20",
    approved: true,
  },
];

function sheetToReview(r: SheetReview): Review {
  return {
    id: r.id,
    productId: r.productId,
    author: r.author,
    rating: r.rating,
    comment: r.comment,
    image: r.image,
    date: r.date,
    approved: r.approved,
  };
}

let cache: { data: Review[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 20_000;

async function getAllReviews(): Promise<Review[]> {
  if (!isSheetsConfigured()) return MOCK_REVIEWS;
  if (cache && cache.expiresAt > Date.now()) return cache.data;
  try {
    const rows = await readReviewsSheet();
    const mapped = rows.map(sheetToReview);
    cache = { data: mapped, expiresAt: Date.now() + CACHE_TTL_MS };
    return mapped;
  } catch (err) {
    console.error("[reviews] Không đọc được Google Sheets:", err);
    return MOCK_REVIEWS;
  }
}

export function invalidateReviewCache(): void {
  cache = null;
}

/** Đánh giá ĐÃ DUYỆT của 1 sản phẩm — dùng để hiển thị công khai. */
export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const all = await getAllReviews();
  return all.filter((r) => r.productId === productId && r.approved);
}

/** Toàn bộ đánh giá (đã + chưa duyệt) — dùng cho trang Admin. */
export async function getAllReviewsForAdmin(): Promise<Review[]> {
  return getAllReviews();
}

export interface SubmitReviewInput {
  productId: string;
  author: string;
  rating: number;
  comment: string;
  image?: string;
}

/** Khách gửi đánh giá mới — mặc định CHƯA DUYỆT (approved: false), chờ Admin duyệt. */
export async function submitReview(input: SubmitReviewInput): Promise<void> {
  if (!isSheetsConfigured()) {
    throw new Error(
      "Chức năng gửi đánh giá cần kết nối Google Sheets — vui lòng thử lại sau."
    );
  }
  const id = `rv_${Date.now().toString(36)}`;
  await createReviewSheet({
    id,
    productId: input.productId,
    author: input.author,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    comment: input.comment,
    image: input.image,
    date: new Date().toLocaleDateString("vi-VN"),
    approved: false,
  });
  invalidateReviewCache();
}
