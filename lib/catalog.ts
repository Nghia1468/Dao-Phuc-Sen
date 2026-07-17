// ---------------------------------------------------------------------------
// Catalog — lớp trung gian duy nhất mà các trang (server components) nên gọi
// để lấy danh sách sản phẩm.
//
// - Nếu đã cấu hình đủ GOOGLE_SHEET_ID / GOOGLE_SERVICE_ACCOUNT_EMAIL /
//   GOOGLE_PRIVATE_KEY → đọc trực tiếp từ Google Sheet "Products".
// - Nếu chưa cấu hình, hoặc gọi Sheets bị lỗi (mất mạng, sai quyền...) →
//   tự động dùng lại dữ liệu mock trong lib/data.ts, kèm cảnh báo ở console,
//   để trang web không bao giờ "trắng trang" khi Sheets có sự cố.
//
// CHỈ import file này từ Server Component / Route Handler. Không import từ
// component có "use client" (vì bên trong dùng googleapis, chỉ chạy được ở
// server).
// ---------------------------------------------------------------------------

import {
  categories,
  getCategoryBySlug,
  getNewProductsMock,
  getSaleProductsMock,
  getBestSellersMock,
  getProductsByCategoryMock,
  getProductByIdMock,
  getRelatedProductsMock,
  getBanners as getBannersMock,
  type Product,
  type Banner,
} from "./data";
import {
  isSheetsConfigured,
  readProducts,
  readBanners,
  type SheetProduct,
} from "./googleSheets";

function sheetProductToProduct(p: SheetProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    category: p.category,
    price: p.price,
    salePrice: p.salePrice,
    shortDescription: p.shortDescription,
    description: p.description,
    images: p.images,
    stock: p.stock,
    isSale: p.isSale,
    isBestSeller: p.isBestSeller,
    isNew: p.isNew,
    isVisible: p.isVisible,
    isFeatured: p.isFeatured,
    colors: p.colors,
    sizes: p.sizes,
    rating: p.rating,
    sold: p.sold,
    reviewCount: p.reviewCount,
    specs: p.specs,
    variants: p.variants,
    video: p.video,
    isPinned: p.isPinned,
  };
}

let cache: { data: Product[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000; // 30s — đủ để tránh gọi Sheets liên tục nhưng vẫn cập nhật nhanh sau khi Admin sửa

/** Đẩy sản phẩm được "Ghim lên đầu" (isPinned) lên đầu mảng — sort ổn định
 *  (stable sort) nên thứ tự tương đối giữa các sản phẩm còn lại không đổi. */
function sortPinnedFirst(list: Product[]): Product[] {
  return [...list].sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned));
}

/** Lấy toàn bộ catalog: ưu tiên Google Sheets, tự rơi về mock nếu có sự cố. */
export async function getCatalog(): Promise<Product[]> {
  if (!isSheetsConfigured()) {
    const { allProducts } = await import("./data");
    return sortPinnedFirst(allProducts);
  }

  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  try {
    const rows = await readProducts();
    const mapped = sortPinnedFirst(rows.map(sheetProductToProduct));
    cache = { data: mapped, expiresAt: Date.now() + CACHE_TTL_MS };
    return mapped;
  } catch (err) {
    console.error(
      "[catalog] Không đọc được Google Sheets, tạm dùng dữ liệu mẫu:",
      err
    );
    const { allProducts } = await import("./data");
    return sortPinnedFirst(allProducts);
  }
}

/** Xoá cache — gọi sau khi Admin thêm/sửa/xoá sản phẩm để trang web cập nhật ngay. */
export function invalidateCatalogCache(): void {
  cache = null;
}

/** Banner trang chủ — ưu tiên Google Sheets ("Banners"), rơi về mock nếu chưa cấu hình/lỗi.
 *  Nếu có ít nhất 1 banner được đánh dấu "Banner chính", banner đó sẽ được xếp lên đầu. */
export async function getBanners(): Promise<Banner[]> {
  if (!isSheetsConfigured()) return getBannersMock();
  try {
    const rows = await readBanners();
    if (rows.length === 0) return getBannersMock();
    const mapped: Banner[] = rows.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      image: b.image,
      primaryCta: b.primaryCta,
      secondaryCta: b.secondaryCta,
    }));
    const mainIndex = rows.findIndex((b) => b.isMain);
    if (mainIndex > 0) {
      const [main] = mapped.splice(mainIndex, 1);
      mapped.unshift(main);
    }
    return mapped;
  } catch (err) {
    console.error("[catalog] Không đọc được Banners từ Google Sheets:", err);
    return getBannersMock();
  }
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  if (!isSheetsConfigured()) return getNewProductsMock(limit);
  const catalog = await getCatalog();
  return catalog.filter((p) => p.isNew).slice(0, limit);
}

export async function getSaleProducts(limit = 8): Promise<Product[]> {
  if (!isSheetsConfigured()) return getSaleProductsMock(limit);
  const catalog = await getCatalog();
  return catalog.filter((p) => p.isSale).slice(0, limit);
}

export async function getBestSellers(limit = 5): Promise<Product[]> {
  if (!isSheetsConfigured()) return getBestSellersMock(limit);
  const catalog = await getCatalog();
  return catalog.filter((p) => p.isBestSeller).slice(0, limit);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  if (!isSheetsConfigured()) return getProductsByCategoryMock(slug);
  const cat = getCategoryBySlug(slug);
  if (!cat) return [];
  const catalog = await getCatalog();
  return catalog.filter((p) => p.category === cat.name);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (!isSheetsConfigured()) return getProductByIdMock(id);
  const catalog = await getCatalog();
  return catalog.find((p) => p.id === id);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  if (!isSheetsConfigured()) return getRelatedProductsMock(product, limit);
  const catalog = await getCatalog();
  return catalog
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export async function getAllSaleProductsAcrossCategories(): Promise<Product[]> {
  const catalog = await getCatalog();
  return catalog.filter((p) => p.isSale);
}

/** Bỏ dấu tiếng Việt + hạ chữ thường, để so khớp "vong tay" ~ "Vòng tay". */
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Tìm kiếm sản phẩm theo tên / danh mục / mô tả.
 * Không phân biệt hoa-thường và không phân biệt dấu tiếng Việt.
 * Trả về mảng rỗng nếu query rỗng.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const q = normalize(query);
  if (!q) return [];

  const catalog = await getCatalog();
  const terms = q.split(/\s+/).filter(Boolean);

  return catalog
    .filter((p) => {
      const haystack = normalize(`${p.name} ${p.category} ${p.description}`);
      // Mỗi từ khoá phải xuất hiện đâu đó trong tên/danh mục/mô tả
      return terms.every((term) => haystack.includes(term));
    })
    .sort((a, b) => {
      // Ưu tiên sản phẩm khớp ở tên lên trước sản phẩm chỉ khớp ở mô tả
      const aNameHit = normalize(a.name).includes(q) ? 0 : 1;
      const bNameHit = normalize(b.name).includes(q) ? 0 : 1;
      return aNameHit - bNameHit;
    });
}

export { categories };
