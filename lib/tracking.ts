// ---------------------------------------------------------------------------
// TRACKING MODULE — nguồn DUY NHẤT được phép ghi vào window.dataLayer.
//
// Kiến trúc: Website → window.dataLayer.push() → GTM → (GA4 + Meta Pixel).
// Component/trang KHÔNG được tự ý push dataLayer trực tiếp — luôn gọi qua các
// hàm export ở đây để đảm bảo đúng format GA4 Ecommerce, tránh trùng lặp và
// dễ mở rộng (thêm event mới chỉ cần thêm 1 hàm ở file này).
//
// Toàn bộ event dùng đúng tên chuẩn GA4 (view_item, add_to_cart,
// begin_checkout, purchase, generate_lead, page_view) — GTM sẽ có trigger lắng
// nghe các tên này để bắn sang GA4 Config tag VÀ Meta Pixel tag (1 lần push ở
// đây = cả GA4 lẫn Meta Pixel đều nhận được, không cần gọi 2 lần).
//
// Mapping cấu hình trong GTM (không phải trong code):
//   view_item       → GA4 event "view_item"       + Meta Pixel "ViewContent"
//   add_to_cart     → GA4 event "add_to_cart"      + Meta Pixel "AddToCart"
//   begin_checkout  → GA4 event "begin_checkout"   + Meta Pixel "InitiateCheckout"
//   purchase        → GA4 event "purchase"         + Meta Pixel "Purchase"
//   generate_lead   → GA4 event "generate_lead"    + Meta Pixel "Lead"
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export const CURRENCY = "VND";

export interface TrackingItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
}

/**
 * Đẩy 1 event vào dataLayer. Luôn reset `ecommerce` về null trước khi push
 * event ecommerce mới — đây là khuyến nghị chính thức của Google để GTM/GA4
 * không "deep-merge" nhầm object ecommerce của event trước vào event hiện
 * tại (lỗi rất phổ biến gây sai lệch dữ liệu items/value).
 * https://developers.google.com/tag-platform/tag-manager/datalayer
 */
function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if ("ecommerce" in payload) {
    window.dataLayer.push({ ecommerce: null });
  }
  window.dataLayer.push(payload);
}

/** Trang chi tiết sản phẩm — gọi 1 lần khi mở/đổi sản phẩm. */
export function trackViewItem(item: TrackingItem): void {
  pushDataLayer({
    event: "view_item",
    ecommerce: {
      currency: CURRENCY,
      value: item.price,
      items: [{ ...item, quantity: item.quantity ?? 1 }],
    },
  });
}

/** Bấm "Thêm vào giỏ hàng" / "Mua ngay" — gọi từ CartContext.addItem() (1 điểm chạm duy nhất). */
export function trackAddToCart(item: TrackingItem): void {
  const quantity = item.quantity ?? 1;
  pushDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: CURRENCY,
      value: item.price * quantity,
      items: [{ ...item, quantity }],
    },
  });
}

/** Vào trang thanh toán (bấm "Mua ngay" / "Thanh toán" / "Tiến hành đặt hàng"). */
export function trackBeginCheckout(items: TrackingItem[], value: number): void {
  if (items.length === 0) return;
  pushDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency: CURRENCY,
      value,
      items,
    },
  });
}

export interface PurchasePayload {
  transactionId: string;
  value: number;
  shipping: number;
  tax?: number;
  coupon?: string;
  items: TrackingItem[];
}

/**
 * Chỉ gọi NGAY SAU KHI API /api/orders trả về thành công (đơn đã ghi Google
 * Sheets thành công) — không gọi ở trang cảm ơn (dễ bắn lại khi F5) và không
 * gọi khi API lỗi. Có chặn trùng lặp theo transactionId qua sessionStorage vì
 * đây là event tiền/doanh thu, tuyệt đối không được đếm 2 lần.
 */
export function trackPurchase(order: PurchasePayload): void {
  if (typeof window === "undefined") return;
  const dedupeKey = `ga4_purchase_sent_${order.transactionId}`;
  try {
    if (window.sessionStorage.getItem(dedupeKey)) return;
    window.sessionStorage.setItem(dedupeKey, "1");
  } catch {
    // sessionStorage không khả dụng (chế độ ẩn danh...) — vẫn cứ gửi, tình
    // huống double-fire ở đây cực hiếm vì hàm này chỉ được gọi 1 lần trong
    // nhánh xử lý thành công của handleSubmit, không nằm trong useEffect.
  }
  pushDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: order.transactionId,
      currency: CURRENCY,
      value: order.value,
      shipping: order.shipping,
      tax: order.tax ?? 0,
      coupon: order.coupon || undefined,
      items: order.items,
    },
  });
}

/** Sự kiện Lead — vd: khách bấm gọi điện / nhắn Zalo. Sẵn sàng cho các form liên hệ sau này. */
export function trackLead(source: string): void {
  pushDataLayer({ event: "generate_lead", lead_source: source });
}

/**
 * "Virtual pageview" cho điều hướng phía client (Next.js App Router không
 * reload trang khi chuyển route). GA4 Config tag trong GTM cần TẮT tuỳ chọn
 * "Send a page view event when this configuration loads" và dùng 1 GA4 Event
 * tag riêng lắng nghe đúng event "page_view" này — tránh đếm trùng lượt xem
 * trang so với lần GTM tự bắn page_view mặc định ở lần tải đầu tiên.
 */
export function trackPageView(path: string): void {
  pushDataLayer({
    event: "page_view",
    page_location: typeof window !== "undefined" ? window.location.href : path,
    page_path: path,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  });
}
