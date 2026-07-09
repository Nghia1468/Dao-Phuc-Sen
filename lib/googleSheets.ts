// ---------------------------------------------------------------------------
// Kết nối Google Sheets — dùng Service Account (server-side only).
//
// Cần khai báo trong .env.local (xem GOOGLE_SHEETS_SETUP.md):
//   GOOGLE_SHEET_ID
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_PRIVATE_KEY
//
// File này chỉ được import từ code chạy trên server (API Route, Server
// Action...) — KHÔNG import từ component "use client".
// ---------------------------------------------------------------------------

import { google } from "googleapis";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Thiếu GOOGLE_SERVICE_ACCOUNT_EMAIL hoặc GOOGLE_PRIVATE_KEY trong .env.local — xem GOOGLE_SHEETS_SETUP.md"
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error("Thiếu GOOGLE_SHEET_ID trong .env.local");
  }
  return id;
}

export async function readSheet(range: string): Promise<string[][]> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range,
  });
  return (res.data.values as string[][]) ?? [];
}

export async function appendRow(
  range: string,
  row: (string | number)[]
): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** Kiểm tra đã cấu hình đủ biến môi trường để gọi Google Sheets chưa. */
export function isSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  );
}

// ---- Products tab ----------------------------------------------------------
// Cột (hàng 1 là tiêu đề, dữ liệu bắt đầu từ hàng 2):
// A:ID  B:Tên sản phẩm  C:Danh mục  D:Giá  E:Giá giảm  F:Mô tả
// G-K: Ảnh 1..5  L:Tồn kho  M:Sale  N:Best Seller  O:Mới
// P:Màu sắc (không dùng cho dao, để trống)  Q:Kích thước (không dùng cho dao, để trống)
// R:Đánh giá  S:Đã bán
// T:Slug  U:Mô tả ngắn  V:Hiển thị (TRUE/FALSE)  W:Nổi bật (TRUE/FALSE)
// X:Số lượt đánh giá  Y:Thông số kỹ thuật (JSON)  Z:Biến thể cán sắt/cán gỗ (JSON)

const PRODUCTS_SHEET_NAME = "Products";
const PRODUCTS_RANGE = `${PRODUCTS_SHEET_NAME}!A2:Z`;

export interface SheetProductVariant {
  handleType: "can-sat" | "can-go";
  label: string;
  price: number;
  salePrice?: number;
  stock?: number;
}

export interface SheetProductSpecs {
  steelType?: string;
  bladeLength?: string;
  bladeWidth?: string;
  handleLength?: string;
  thickness?: string;
  weight?: string;
  handleMaterial?: string;
  origin?: string;
  warranty?: string;
}

export interface SheetProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  shortDescription?: string;
  description: string;
  images: string[];
  stock: number;
  isSale: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  colors: string[];
  sizes: string[];
  rating?: number;
  sold?: number;
  reviewCount?: number;
  specs?: SheetProductSpecs;
  variants?: SheetProductVariant[];
  /** Số thứ tự dòng thật trên Sheet (dùng nội bộ để update/delete), hàng 1 = header. */
  rowNumber: number;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toBool(value: string | undefined): boolean {
  return (value ?? "").trim().toUpperCase() === "TRUE";
}

function parseJsonSafe<T>(value: string | undefined): T | undefined {
  if (!value || !value.trim()) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function rowToProduct(row: string[], rowNumber: number): SheetProduct {
  return {
    id: row[0] ?? "",
    name: row[1] ?? "",
    category: row[2] ?? "",
    price: Number(row[3]) || 0,
    salePrice: row[4] && !Number.isNaN(Number(row[4])) ? Number(row[4]) : undefined,
    description: row[5] ?? "",
    images: [row[6], row[7], row[8], row[9], row[10]].filter(Boolean) as string[],
    stock: Number(row[11]) || 0,
    isSale: toBool(row[12]),
    isBestSeller: toBool(row[13]),
    isNew: toBool(row[14]),
    colors: splitList(row[15]),
    sizes: splitList(row[16]),
    rating: row[17] && !Number.isNaN(Number(row[17])) ? Number(row[17]) : undefined,
    sold: row[18] && !Number.isNaN(Number(row[18])) ? Number(row[18]) : undefined,
    slug: row[19] || (row[0] ?? ""),
    shortDescription: row[20] || undefined,
    isVisible: row[21] === undefined || row[21] === "" ? true : toBool(row[21]),
    isFeatured: toBool(row[22]),
    reviewCount: row[23] && !Number.isNaN(Number(row[23])) ? Number(row[23]) : undefined,
    specs: parseJsonSafe<SheetProductSpecs>(row[24]),
    variants: parseJsonSafe<SheetProductVariant[]>(row[25]),
    rowNumber,
  };
}

function productToRow(p: Omit<SheetProduct, "rowNumber">): (string | number)[] {
  return [
    p.id,
    p.name,
    p.category,
    p.price,
    p.salePrice ?? "",
    p.description,
    p.images[0] ?? "",
    p.images[1] ?? "",
    p.images[2] ?? "",
    p.images[3] ?? "",
    p.images[4] ?? "",
    p.stock,
    p.isSale ? "TRUE" : "FALSE",
    p.isBestSeller ? "TRUE" : "FALSE",
    p.isNew ? "TRUE" : "FALSE",
    p.colors.join(", "),
    p.sizes.join(", "),
    p.rating ?? "",
    p.sold ?? "",
    p.slug,
    p.shortDescription ?? "",
    p.isVisible ? "TRUE" : "FALSE",
    p.isFeatured ? "TRUE" : "FALSE",
    p.reviewCount ?? "",
    p.specs ? JSON.stringify(p.specs) : "",
    p.variants ? JSON.stringify(p.variants) : "",
  ];
}

/** Đọc toàn bộ sản phẩm từ Sheet "Products". */
export async function readProducts(): Promise<SheetProduct[]> {
  const rows = await readSheet(PRODUCTS_RANGE);
  return rows
    .map((row, i) => rowToProduct(row, i + 2)) // hàng 2 trở đi
    .filter((p) => p.id); // bỏ dòng trống
}

/** Thêm sản phẩm mới (append xuống cuối sheet). */
export async function createProduct(
  product: Omit<SheetProduct, "rowNumber">
): Promise<void> {
  await appendRow(`${PRODUCTS_SHEET_NAME}!A:Z`, productToRow(product));
}

/** Cập nhật sản phẩm theo đúng dòng (rowNumber lấy từ readProducts()). */
export async function updateProductRow(
  rowNumber: number,
  product: Omit<SheetProduct, "rowNumber">
): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${PRODUCTS_SHEET_NAME}!A${rowNumber}:Z${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [productToRow(product)] },
  });
}

/** Lấy sheetId nội bộ (số) của một tab theo tên — cần để xóa hẳn 1 dòng. */
async function getInternalSheetId(sheetTitle: string): Promise<number> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: getSheetId() });
  const found = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetTitle
  );
  if (!found?.properties?.sheetId && found?.properties?.sheetId !== 0) {
    throw new Error(`Không tìm thấy sheet tên "${sheetTitle}"`);
  }
  return found.properties.sheetId as number;
}

/** Xóa hẳn một dòng sản phẩm khỏi Sheet (không chỉ xóa nội dung). */
export async function deleteProductRow(rowNumber: number): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const sheetId = await getInternalSheetId(PRODUCTS_SHEET_NAME);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1, // 0-indexed
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
}

// ---- Orders tab -----------------------------------------------------------
// Cột: Mã đơn | Họ tên | SĐT | Email | Địa chỉ | Tỉnh/Thành phố | Phường/Xã |
//      Sản phẩm | Số lượng | Tạm tính | Mã giảm giá | Phí vận chuyển |
//      Tổng tiền | Phương thức thanh toán | Trạng thái | Ngày đặt | Ghi chú

export interface OrderInput {
  orderId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  ward: string;
  productsSummary: string; // ví dụ: "Vòng tay Obsidian x1, Vòng cổ Suki x2"
  quantity: number;
  subtotal: number;
  voucherCode: string;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  status: string;
  note: string;
}

export async function appendOrder(order: OrderInput): Promise<void> {
  const row = [
    order.orderId,
    order.fullName,
    order.phone,
    order.email,
    order.address,
    order.province,
    order.ward,
    order.productsSummary,
    order.quantity,
    order.subtotal,
    order.voucherCode,
    order.shippingFee,
    order.total,
    order.paymentMethod,
    order.status,
    new Date().toLocaleString("vi-VN"),
    order.note,
  ];
  await appendRow("Orders!A:Q", row);
}

const ORDERS_SHEET_NAME = "Orders";
const ORDERS_RANGE = `${ORDERS_SHEET_NAME}!A2:Q`;

/** 5 trạng thái đơn hàng hợp lệ, theo đúng yêu cầu nghiệp vụ Dao Phúc Sen. */
export const ORDER_STATUSES = [
  "Chờ xác nhận",
  "Đã gọi",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface SheetOrder {
  orderId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  ward: string;
  productsSummary: string;
  quantity: number;
  subtotal: number;
  voucherCode: string;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  status: string;
  orderedAt: string;
  note: string;
  rowNumber: number;
}

function rowToOrder(row: string[], rowNumber: number): SheetOrder {
  return {
    orderId: row[0] ?? "",
    fullName: row[1] ?? "",
    phone: row[2] ?? "",
    email: row[3] ?? "",
    address: row[4] ?? "",
    province: row[5] ?? "",
    ward: row[6] ?? "",
    productsSummary: row[7] ?? "",
    quantity: Number(row[8]) || 0,
    subtotal: Number(row[9]) || 0,
    voucherCode: row[10] ?? "",
    shippingFee: Number(row[11]) || 0,
    total: Number(row[12]) || 0,
    paymentMethod: row[13] ?? "",
    status: row[14] || "Chờ xác nhận",
    orderedAt: row[15] ?? "",
    note: row[16] ?? "",
    rowNumber,
  };
}

/** Đọc toàn bộ đơn hàng, mới nhất trước — dùng cho trang Admin /admin/don-hang. */
export async function readOrders(): Promise<SheetOrder[]> {
  const rows = await readSheet(ORDERS_RANGE);
  return rows
    .map((row, i) => rowToOrder(row, i + 2))
    .filter((o) => o.orderId)
    .reverse();
}

/** Cập nhật trạng thái + ghi chú của 1 đơn hàng (chỉ 2 cột O:trạng thái, Q:ghi chú). */
export async function updateOrderStatus(
  rowNumber: number,
  status: string,
  note: string
): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${ORDERS_SHEET_NAME}!O${rowNumber}:O${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[status]] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${ORDERS_SHEET_NAME}!Q${rowNumber}:Q${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[note]] },
  });
}

// ---- Banners tab -------------------------------------------------------------
// Cột: ID | Tiêu đề | Mô tả phụ | Ảnh | Nút chính | Nút phụ | Banner chính (TRUE/FALSE)

const BANNERS_SHEET_NAME = "Banners";
const BANNERS_RANGE = `${BANNERS_SHEET_NAME}!A2:G`;

export interface SheetBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  primaryCta: string;
  secondaryCta: string;
  isMain: boolean;
  rowNumber: number;
}

function rowToBanner(row: string[], rowNumber: number): SheetBanner {
  return {
    id: row[0] ?? "",
    title: row[1] ?? "",
    subtitle: row[2] ?? "",
    image: row[3] ?? "",
    primaryCta: row[4] ?? "Mua ngay",
    secondaryCta: row[5] ?? "Thêm vào giỏ hàng",
    isMain: toBool(row[6]),
    rowNumber,
  };
}

function bannerToRow(b: Omit<SheetBanner, "rowNumber">): (string | number)[] {
  return [
    b.id,
    b.title,
    b.subtitle,
    b.image,
    b.primaryCta,
    b.secondaryCta,
    b.isMain ? "TRUE" : "FALSE",
  ];
}

export async function readBanners(): Promise<SheetBanner[]> {
  const rows = await readSheet(BANNERS_RANGE);
  return rows.map((row, i) => rowToBanner(row, i + 2)).filter((b) => b.id);
}

export async function createBanner(
  banner: Omit<SheetBanner, "rowNumber">
): Promise<void> {
  await appendRow(`${BANNERS_SHEET_NAME}!A:G`, bannerToRow(banner));
}

export async function updateBannerRow(
  rowNumber: number,
  banner: Omit<SheetBanner, "rowNumber">
): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${BANNERS_SHEET_NAME}!A${rowNumber}:G${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [bannerToRow(banner)] },
  });
}

export async function deleteBannerRow(rowNumber: number): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const sheetId = await getInternalSheetId(BANNERS_SHEET_NAME);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber },
          },
        },
      ],
    },
  });
}

// ---- Vouchers tab -----------------------------------------------------------
// Cột: Mã | Loại | Giá trị | Đơn tối thiểu | Mô tả | Kích hoạt | Ngày hết hạn |
//      Độc quyền | Loại trừ Freeship
// Loại: "percent" | "fixed" | "freeship"

const VOUCHERS_SHEET_NAME = "Vouchers";
const VOUCHERS_RANGE = `${VOUCHERS_SHEET_NAME}!A2:I`;

export interface SheetVoucher {
  code: string;
  type: "percent" | "fixed" | "freeship";
  value: number;
  minSubtotal: number;
  label: string;
  active: boolean;
  expiresAt?: string;
  /** TRUE = mã "độc quyền", không dùng chung được với BẤT KỲ mã nào khác. */
  exclusive: boolean;
  /** TRUE = không được áp dụng cùng lúc với mã miễn phí vận chuyển (và ngược lại). */
  excludesFreeship: boolean;
  rowNumber: number;
}

function rowToVoucher(row: string[], rowNumber: number): SheetVoucher {
  const type = (row[1] ?? "percent").trim() as SheetVoucher["type"];
  return {
    code: (row[0] ?? "").trim().toUpperCase(),
    type: ["percent", "fixed", "freeship"].includes(type) ? type : "percent",
    value: Number(row[2]) || 0,
    minSubtotal: Number(row[3]) || 0,
    label: row[4] ?? "",
    active: toBool(row[5]),
    expiresAt: row[6] || undefined,
    exclusive: toBool(row[7]),
    excludesFreeship: toBool(row[8]),
    rowNumber,
  };
}

function voucherToRow(v: Omit<SheetVoucher, "rowNumber">): (string | number)[] {
  return [
    v.code.trim().toUpperCase(),
    v.type,
    v.value,
    v.minSubtotal,
    v.label,
    v.active ? "TRUE" : "FALSE",
    v.expiresAt ?? "",
    v.exclusive ? "TRUE" : "FALSE",
    v.excludesFreeship ? "TRUE" : "FALSE",
  ];
}

export async function readVouchers(): Promise<SheetVoucher[]> {
  const rows = await readSheet(VOUCHERS_RANGE);
  return rows.map((row, i) => rowToVoucher(row, i + 2)).filter((v) => v.code);
}

export async function createVoucher(
  voucher: Omit<SheetVoucher, "rowNumber">
): Promise<void> {
  await appendRow(`${VOUCHERS_SHEET_NAME}!A:I`, voucherToRow(voucher));
}

export async function updateVoucherRow(
  rowNumber: number,
  voucher: Omit<SheetVoucher, "rowNumber">
): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${VOUCHERS_SHEET_NAME}!A${rowNumber}:I${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [voucherToRow(voucher)] },
  });
}

export async function deleteVoucherRow(rowNumber: number): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const sheetId = await getInternalSheetId(VOUCHERS_SHEET_NAME);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
}

// ---- ProductViews tab -------------------------------------------------------
// Ghi lại mỗi lượt khách xem trang chi tiết sản phẩm, dùng cho Dashboard Admin.
// Cột: Thời gian | Mã sản phẩm | Tên sản phẩm | Danh mục

const VIEWS_SHEET_NAME = "ProductViews";

export interface ProductViewEntry {
  productId: string;
  productName: string;
  category: string;
}

export interface ProductViewRow extends ProductViewEntry {
  viewedAt: string;
}

/** Ghi 1 lượt xem sản phẩm. Không throw ra ngoài — lỗi chỉ log, không ảnh hưởng trải nghiệm khách. */
export async function trackProductView(entry: ProductViewEntry): Promise<void> {
  try {
    await appendRow(`${VIEWS_SHEET_NAME}!A:D`, [
      new Date().toLocaleString("vi-VN"),
      entry.productId,
      entry.productName,
      entry.category,
    ]);
  } catch (err) {
    console.error("[trackProductView] Không ghi được lượt xem:", err);
  }
}

/** Đọc tối đa `limit` lượt xem gần nhất (mặc định 500 dòng cuối). */
export async function readProductViews(limit = 500): Promise<ProductViewRow[]> {
  const rows = await readSheet(`${VIEWS_SHEET_NAME}!A2:D`);
  const parsed = rows
    .filter((r) => r[1])
    .map((r) => ({
      viewedAt: r[0] ?? "",
      productId: r[1] ?? "",
      productName: r[2] ?? "",
      category: r[3] ?? "",
    }));
  return parsed.slice(-limit).reverse();
}

// ---- Reviews tab -------------------------------------------------------------
// Đánh giá khách hàng: sao, bình luận, ảnh thực tế. Khách gửi công khai qua
// trang chi tiết sản phẩm; Admin duyệt trước khi hiển thị công khai.
// Cột: ID | Mã sản phẩm | Tên khách | Số sao | Bình luận | Ảnh | Ngày | Duyệt

const REVIEWS_SHEET_NAME = "Reviews";
const REVIEWS_RANGE = `${REVIEWS_SHEET_NAME}!A2:H`;

export interface SheetReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  image?: string;
  date: string;
  approved: boolean;
  rowNumber: number;
}

function rowToReview(row: string[], rowNumber: number): SheetReview {
  return {
    id: row[0] ?? "",
    productId: row[1] ?? "",
    author: row[2] ?? "",
    rating: Number(row[3]) || 5,
    comment: row[4] ?? "",
    image: row[5] || undefined,
    date: row[6] ?? "",
    approved: toBool(row[7]),
    rowNumber,
  };
}

function reviewToRow(r: Omit<SheetReview, "rowNumber">): (string | number)[] {
  return [
    r.id,
    r.productId,
    r.author,
    r.rating,
    r.comment,
    r.image ?? "",
    r.date,
    r.approved ? "TRUE" : "FALSE",
  ];
}

export async function readReviews(): Promise<SheetReview[]> {
  const rows = await readSheet(REVIEWS_RANGE);
  return rows.map((row, i) => rowToReview(row, i + 2)).filter((r) => r.id);
}

export async function createReview(
  review: Omit<SheetReview, "rowNumber">
): Promise<void> {
  await appendRow(`${REVIEWS_SHEET_NAME}!A:H`, reviewToRow(review));
}

export async function updateReviewRow(
  rowNumber: number,
  review: Omit<SheetReview, "rowNumber">
): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${REVIEWS_SHEET_NAME}!A${rowNumber}:H${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [reviewToRow(review)] },
  });
}

export async function deleteReviewRow(rowNumber: number): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const sheetId = await getInternalSheetId(REVIEWS_SHEET_NAME);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber },
          },
        },
      ],
    },
  });
}

// ---- Posts tab (Blog) --------------------------------------------------------
// Cột: Slug | Tiêu đề | Mô tả ngắn | Nội dung (markdown) | Ảnh bìa | Tác giả |
//      Ngày đăng | Trạng thái (Published/Draft)

const POSTS_SHEET_NAME = "Posts";
const POSTS_RANGE = `${POSTS_SHEET_NAME}!A2:H`;

export interface SheetPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  status: "Published" | "Draft";
  rowNumber: number;
}

function rowToPost(row: string[], rowNumber: number): SheetPost {
  const status = (row[7] ?? "Draft").trim();
  return {
    slug: row[0] ?? "",
    title: row[1] ?? "",
    excerpt: row[2] ?? "",
    content: row[3] ?? "",
    coverImage: row[4] ?? "",
    author: row[5] ?? "Dao Phúc Sen",
    publishedAt: row[6] ?? "",
    status: status === "Published" ? "Published" : "Draft",
    rowNumber,
  };
}

function postToRow(p: Omit<SheetPost, "rowNumber">): (string | number)[] {
  return [
    p.slug.trim(),
    p.title,
    p.excerpt,
    p.content,
    p.coverImage,
    p.author,
    p.publishedAt,
    p.status,
  ];
}

export async function readPosts(): Promise<SheetPost[]> {
  const rows = await readSheet(POSTS_RANGE);
  return rows.map((row, i) => rowToPost(row, i + 2)).filter((p) => p.slug);
}

export async function createPost(post: Omit<SheetPost, "rowNumber">): Promise<void> {
  await appendRow(`${POSTS_SHEET_NAME}!A:H`, postToRow(post));
}

export async function updatePostRow(
  rowNumber: number,
  post: Omit<SheetPost, "rowNumber">
): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${POSTS_SHEET_NAME}!A${rowNumber}:H${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [postToRow(post)] },
  });
}

export async function deletePostRow(rowNumber: number): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const sheetId = await getInternalSheetId(POSTS_SHEET_NAME);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber },
          },
        },
      ],
    },
  });
}
