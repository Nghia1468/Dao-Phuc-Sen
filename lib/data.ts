// ---------------------------------------------------------------------------
// Data layer — DAO PHÚC SEN
//
// File này là nơi DUY NHẤT "biết" dữ liệu sản phẩm đến từ đâu. Hiện tại trả
// về dữ liệu mock có cấu trúc giống hệt tab Google Sheet "Products" tương lai
// (xem GOOGLE_SHEETS_SETUP.md). Khi Sheet sẵn sàng, lib/catalog.ts sẽ tự động
// ưu tiên đọc từ Sheets và rơi về mock này nếu có sự cố — không component nào
// cần đổi vì luôn chỉ import qua lib/catalog.ts (server) hoặc file này.
// ---------------------------------------------------------------------------

export interface ProductVariant {
  /** Định danh nội bộ duy nhất (tự sinh khi tạo, không hiển thị cho khách). */
  id: string;
  /** Tên tuỳ biến — tự nhập tự do, ví dụ "Cán Sắt", "Cán Gỗ", "Cán Titan", "23cm"... */
  label: string;
  price: number;
  salePrice?: number;
  /** Tồn kho riêng theo từng tuỳ biến — để trống nếu dùng chung tồn kho sản phẩm. */
  stock?: number;
}

/** Thông số kỹ thuật riêng cho dao/sản phẩm rèn thủ công. */
export interface ProductSpecs {
  steelType?: string; // Loại thép
  bladeLength?: string; // Chiều dài lưỡi
  bladeWidth?: string; // Bản rộng lưỡi
  handleLength?: string; // Chiều dài cán
  thickness?: string; // Độ dày
  weight?: string; // Trọng lượng
  handleMaterial?: string; // Chất liệu cán (mặc định, khi không chọn biến thể)
  origin?: string; // Xuất xứ
  warranty?: string; // Bảo hành
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  /** Giá hiển thị mặc định ở danh sách sản phẩm — thường là giá biến thể Cán Sắt (rẻ nhất). */
  price: number;
  salePrice?: number;
  shortDescription?: string;
  description: string;
  images: string[];
  stock: number;
  isSale: boolean;
  isBestSeller: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isVisible?: boolean;
  rating?: number;
  sold?: number;
  reviewCount?: number;
  specs?: ProductSpecs;
  /** Tuỳ biến sản phẩm — tên tự đặt (VD: Cán Sắt, Cán Gỗ, Cán Titan...), mỗi loại có giá riêng. Bỏ trống nếu sản phẩm chỉ có 1 phiên bản (ví dụ đá mài). */
  variants?: ProductVariant[];
  /** Link Youtube HOẶC URL video đã tải lên (Cloudinary) — chỉ hiển thị ở trang chi tiết sản phẩm, luôn đứng đầu gallery. */
  video?: string;
  /** TRUE = ghim sản phẩm lên đầu danh sách (trang chủ, danh mục, tìm kiếm...). */
  isPinned?: boolean;
  /** Giữ lại để tương thích — không dùng cho dao (không có màu/size). */
  colors?: string[];
  sizes?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
}

export type VoucherType = "percent" | "fixed" | "freeship";

export interface Voucher {
  code: string;
  type: VoucherType;
  value: number;
  minSubtotal: number;
  label: string;
  active: boolean;
  expiresAt?: string;
  exclusive: boolean;
  excludesFreeship: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  primaryCta: string;
  secondaryCta: string;
}

const IMG = {
  daoChatGa: "/images/products/dao-chat-ga.jpg",
  daoChatGa2: "/images/products/dao-chat-ga-2.jpg",
  daoChatXuong: "/images/products/dao-chat-xuong.jpg",
  daoBauLocThai: "/images/products/dao-bau-loc-thai.jpg",
  daoBauLocGaVit: "/images/products/dao-bau-loc-gavit.jpg",
  daoThaiThit: "/images/products/dao-thai-thit.jpg",
  daoGotCuQua: "/images/products/dao-got-cu-qua.jpg",
  daoThaiLon: "/images/products/dao-thai-lon.jpg",
  combo3San: "/images/products/combo-3-dao-sat.jpg",
  combo3Go: "/images/products/combo-3-dao-go.jpg",
  combo5San: "/images/products/combo-5-dao-sat.jpg",
  combo5Go: "/images/products/combo-5-dao-go.jpg",
  hero1: "/images/brand/hero-1.jpg",
  hero2: "/images/brand/hero-2.jpg",
  hero3: "/images/brand/hero-3.jpg",
  hero4: "/images/brand/hero-4.jpg",
  bgForge: "/images/brand/bg-forge.jpg",
};

const DEFAULT_SPECS: ProductSpecs = {
  steelType: "100% nhíp đỏ Nga (thép nhíp ô tô tái rèn)",
  handleMaterial: "Cán sắt hoặc cán gỗ nghiến (tùy chọn)",
  origin: "Làng rèn Phúc Sen, Quảng Uyên, Cao Bằng",
  warranty: "Bảo hành lỗi rèn 6 tháng, mài lại miễn phí lần đầu",
};

export const categories: Category[] = [
  { id: "c1", name: "Dao chặt", slug: "dao-chat", image: IMG.daoChatGa, icon: "bi-lightning-charge" },
  { id: "c2", name: "Dao thái", slug: "dao-thai", image: IMG.daoThaiThit, icon: "bi-crop" },
  { id: "c3", name: "Dao bầu/lọc", slug: "dao-bau", image: IMG.daoBauLocThai, icon: "bi-droplet" },
  { id: "c5", name: "Combo", slug: "combo", image: IMG.combo5San, icon: "bi-box-seam" },
  { id: "c6", name: "Đá mài", slug: "da-mai", image: IMG.bgForge, icon: "bi-hexagon" },
];

export const banners: Banner[] = [
  {
    id: "b1",
    title: "Dao Chặt Gà — Tinh hoa rèn thủ công",
    subtitle: "Rèn thủ công làng nghề Phúc Sen — dùng trong bếp gia đình và chế biến thực phẩm",
    image: IMG.hero1,
    primaryCta: "Mua ngay",
    secondaryCta: "Thêm vào giỏ hàng",
  },
  {
    id: "b2",
    title: "Dao Chặt Xương — Thép dày, bền chắc",
    subtitle: "Rèn thủ công, chuyên dùng chế biến xương heo, bò trong bếp",
    image: IMG.hero2,
    primaryCta: "Mua ngay",
    secondaryCta: "Thêm vào giỏ hàng",
  },
  {
    id: "b3",
    title: "Dao Bầu Cao Cấp",
    subtitle: "Cán gỗ chắc tay — lưỡi thép rèn thủ công bền đẹp theo năm tháng",
    image: IMG.hero3,
    primaryCta: "Mua ngay",
    secondaryCta: "Thêm vào giỏ hàng",
  },
  {
    id: "b4",
    title: "Combo Dao Bếp Tiết Kiệm",
    subtitle: "Bộ dao đầy đủ cho căn bếp gia đình — tiết kiệm đến 18%",
    image: IMG.hero4,
    primaryCta: "Mua ngay",
    secondaryCta: "Thêm vào giỏ hàng",
  },
];

export const vouchers: Voucher[] = [
  {
    code: "SEN10",
    type: "percent",
    value: 10,
    minSubtotal: 300000,
    label: "Giảm 10% cho đơn từ 300.000₫",
    active: true,
    exclusive: false,
    excludesFreeship: false,
  },
  {
    code: "SEN15",
    type: "percent",
    value: 15,
    minSubtotal: 600000,
    label: "Giảm 15% cho đơn từ 600.000₫",
    active: true,
    exclusive: false,
    excludesFreeship: false,
  },
  {
    code: "FREESHIP",
    type: "freeship",
    value: 0,
    minSubtotal: 0,
    label: "Miễn phí vận chuyển toàn quốc",
    active: true,
    exclusive: false,
    excludesFreeship: false,
  },
  {
    code: "COMBOVIP",
    type: "percent",
    value: 20,
    minSubtotal: 1000000,
    label: "Giảm 20% cho đơn từ 1.000.000₫ — mã độc quyền, không dùng chung mã khác",
    active: true,
    exclusive: true,
    excludesFreeship: true,
  },
];

// ---------------------------------------------------------------------------
// Dữ liệu dao thật, lấy từ website tĩnh Dao Phúc Sen (products.js), chuyển
// sang schema mới có biến thể Cán Sắt / Cán Gỗ (mỗi loại giá riêng) + thông
// số kỹ thuật chi tiết.
// ---------------------------------------------------------------------------

export const products: Product[] = [
  {
    id: "dc-ga",
    slug: "dao-chat-ga",
    name: "Dao Chặt Gà",
    category: "Dao chặt",
    price: 330000,
    shortDescription: "Dao chặt gà, vịt rèn thủ công — thép nhíp đỏ Nga, bền sắc.",
    description:
      "Dao Chặt Gà Phúc Sen được rèn thủ công 100% từ thép nhíp đỏ Nga, độ cứng cao, giữ được độ sắc bén lâu dài. Thiết kế bản rộng, dày dặn giúp chặt gà, vịt gọn gàng, không bị vỡ xương. Có thể chọn cán sắt (chắc chắn, giá tốt) hoặc cán gỗ nghiến (êm tay, sang trọng hơn).",
    images: [IMG.daoChatGa, IMG.daoChatGa2],
    stock: 40,
    isSale: false,
    isBestSeller: true,
    isNew: true,
    isFeatured: true,
    isVisible: true,
    rating: 4.9,
    sold: 2240,
    reviewCount: 128,
    specs: {
      ...DEFAULT_SPECS,
      bladeLength: "22 – 23 cm",
      bladeWidth: "8 – 8.5 cm",
      handleLength: "12 – 13 cm",
      thickness: "3 mm",
      weight: "500 – 600 gram",
    },
    variants: [
      { id: "can-sat", label: "Cán Sắt", price: 330000, stock: 22 },
      { id: "can-go", label: "Cán Gỗ", price: 360000, stock: 18 },
    ],
  },
  {
    id: "dc-xuong",
    slug: "dao-chat-xuong",
    name: "Dao Chặt Xương",
    category: "Dao chặt",
    price: 380000,
    shortDescription: "Dao chặt xương ống, chân giò — thép dày, lực chặt mạnh.",
    description:
      "Dao Chặt Xương phù hợp chế biến xương ống, chân giò heo bò trong bếp gia đình lẫn quán ăn. Lưỡi dày 5 ly, bản rộng, rèn thủ công từ thép nhíp đỏ Nga giúp chịu lực tốt, không bị mẻ hay cong vênh khi chặt xương lớn.",
    images: [IMG.daoChatXuong],
    stock: 30,
    isSale: false,
    isBestSeller: false,
    isNew: true,
    isVisible: true,
    rating: 4.2,
    sold: 1463,
    reviewCount: 68,
    specs: {
      ...DEFAULT_SPECS,
      bladeLength: "22 – 23 cm",
      bladeWidth: "8 – 8.5 cm",
      handleLength: "12 – 13 cm",
      thickness: "5 mm",
      weight: "700 – 800 gram",
    },
    variants: [
      { id: "can-sat", label: "Cán Sắt", price: 380000, stock: 16 },
      { id: "can-go", label: "Cán Gỗ", price: 410000, stock: 14 },
    ],
  },
  {
    id: "dt-thit",
    slug: "dao-thai-thit",
    name: "Dao Thái Thịt",
    category: "Dao thái",
    price: 285000,
    shortDescription: "Dao thái thịt sống/chín mỏng đều — lưỡi mỏng, rèn tay.",
    description:
      "Dao Thái Thịt lưỡi mỏng, nhẹ tay, giúp thái thịt sống lẫn thịt chín thành lát mỏng đều, tiện lợi cho bữa cơm gia đình hằng ngày. Rèn thủ công từ thép nhíp đỏ Nga, giữ sắc bén lâu, dễ mài lại.",
    images: [IMG.daoThaiThit],
    stock: 35,
    isSale: false,
    isBestSeller: true,
    isNew: false,
    isVisible: true,
    rating: 4.4,
    sold: 2350,
    reviewCount: 189,
    specs: {
      ...DEFAULT_SPECS,
      bladeLength: "20 – 21 cm",
      bladeWidth: "3 – 4 cm",
      handleLength: "12 – 13 cm",
      thickness: "1.6 mm",
      weight: "250 – 300 gram",
    },
    variants: [
      { id: "can-sat", label: "Cán Sắt", price: 285000, stock: 20 },
      { id: "can-go", label: "Cán Gỗ", price: 300000, stock: 15 },
    ],
  },
  {
    id: "dt-gotcuqua",
    slug: "dao-got-cu-qua",
    name: "Dao Gọt Củ Quả",
    category: "Dao thái",
    price: 200000,
    shortDescription: "Dao nhỏ gọn gọt củ quả, trái cây — dễ thao tác.",
    description:
      "Dao Gọt Củ Quả kích thước nhỏ gọn, lưỡi mỏng sắc bén, phù hợp gọt vỏ củ quả, trái cây hoặc các thao tác cắt tỉa tinh tế trong bếp. Rèn thủ công, thép nhíp đỏ Nga bền sắc.",
    images: [IMG.daoGotCuQua],
    stock: 45,
    isSale: false,
    isBestSeller: false,
    isNew: true,
    isVisible: true,
    rating: 4.7,
    sold: 1560,
    reviewCount: 164,
    specs: {
      ...DEFAULT_SPECS,
      bladeLength: "16 – 17 cm",
      bladeWidth: "2.5 – 3 cm",
      handleLength: "12 – 13 cm",
      thickness: "1.6 mm",
      weight: "200 – 300 gram",
    },
    variants: [
      { id: "can-sat", label: "Cán Sắt", price: 200000, stock: 25 },
      { id: "can-go", label: "Cán Gỗ", price: 230000, stock: 20 },
    ],
  },
  {
    id: "db-locthai",
    slug: "dao-bau-loc-thai",
    name: "Dao Bầu Lọc Thái",
    category: "Dao bầu/lọc",
    price: 265000,
    shortDescription: "Dao bầu đa năng — lọc, thái đều được, cán chắc tay.",
    description:
      "Dao Bầu Lọc Thái là dòng dao đa năng, vừa lọc thịt cá vừa thái được rau củ, phù hợp làm dao chủ lực trong bếp gia đình. Bản rộng vừa phải, dày 1.6 ly, rèn thủ công bởi nghệ nhân làng Phúc Sen.",
    images: [IMG.daoBauLocThai],
    stock: 38,
    isSale: false,
    isBestSeller: false,
    isNew: false,
    isVisible: true,
    rating: 4.4,
    sold: 2530,
    reviewCount: 156,
    specs: {
      ...DEFAULT_SPECS,
      bladeLength: "21 – 22 cm",
      bladeWidth: "4 – 5 cm",
      handleLength: "12 – 13 cm",
      thickness: "1.6 mm",
      weight: "250 – 350 gram",
    },
    variants: [
      { id: "can-sat", label: "Cán Sắt", price: 265000, stock: 20 },
      { id: "can-go", label: "Cán Gỗ", price: 285000, stock: 18 },
    ],
  },
  {
    id: "db-locgavit",
    slug: "dao-loc-ga-vit",
    name: "Dao Bầu Lọc Gà/Vịt",
    category: "Dao bầu/lọc",
    price: 265000,
    shortDescription: "Dao lọc chuyên dụng cho gà, vịt — lưỡi nhỏ, thao tác linh hoạt.",
    description:
      "Dao Bầu Lọc Gà/Vịt có kích thước nhỏ gọn, lưỡi mỏng linh hoạt, chuyên dùng để lọc thịt gà, vịt nhanh gọn, sát xương, hạn chế hao hụt thịt. Rèn thủ công từ thép nhíp đỏ Nga.",
    images: [IMG.daoBauLocGaVit],
    stock: 28,
    isSale: true,
    isBestSeller: false,
    isNew: false,
    isVisible: true,
    rating: 4.3,
    sold: 1170,
    reviewCount: 46,
    specs: {
      ...DEFAULT_SPECS,
      bladeLength: "11 – 12 cm",
      bladeWidth: "3 – 4 cm",
      handleLength: "12 – 13 cm",
      thickness: "1.6 mm",
      weight: "200 – 300 gram",
    },
    variants: [
      { id: "can-sat", label: "Cán Sắt", price: 265000, salePrice: 239000, stock: 14 },
      { id: "can-go", label: "Cán Gỗ", price: 385000, stock: 12 },
    ],
  },
  {
    id: "cb-3dao",
    slug: "combo-3-dao",
    name: "Combo 3 Dao Bếp",
    category: "Combo",
    price: 840000,
    shortDescription: "Combo dao chặt gà/vịt + dao chuyên thái + dao bầu lọc — tiết kiệm 15%.",
    description:
      "Combo 3 Dao Bếp gồm: Dao chặt gà/vịt, Dao chuyên thái và Dao bầu lọc — đầy đủ cho các nhu cầu cơ bản trong bếp gia đình. Mua combo tiết kiệm 15% so với mua lẻ từng chiếc, cùng chất lượng rèn thủ công làng nghề Phúc Sen.",
    images: [IMG.combo3San, IMG.combo3Go],
    stock: 20,
    isSale: true,
    isBestSeller: false,
    isNew: false,
    isVisible: true,
    rating: 4.4,
    sold: 894,
    reviewCount: 49,
    specs: {
      ...DEFAULT_SPECS,
      handleMaterial: "Cán sắt hoặc cán gỗ (đồng bộ cả 3 dao trong combo)",
    },
    variants: [
      { id: "can-sat", label: "Cán Sắt", price: 840000, stock: 10 },
      { id: "can-go", label: "Cán Gỗ", price: 940000, stock: 10 },
    ],
  },
  {
    id: "cb-5dao",
    slug: "combo-5-dao",
    name: "Combo 5 Dao Bếp",
    category: "Combo",
    price: 1300000,
    salePrice: 1250000,
    shortDescription: "Bộ 5 dao đầy đủ: bầu lọc, gọt củ quả, chuyên thái, chặt gà, chặt xương.",
    description:
      "Combo 5 Dao Bếp là bộ sưu tập đầy đủ nhất, gồm: Dao bầu lọc, Dao gọt củ quả, Dao chuyên thái, Dao chặt gà và Dao chặt xương. Phù hợp cho gia đình có nhu cầu chế biến đa dạng hoặc các quán ăn, nhà hàng nhỏ. Tiết kiệm đến 18% so với mua lẻ.",
    images: [IMG.combo5San, IMG.combo5Go],
    stock: 15,
    isSale: true,
    isBestSeller: true,
    isNew: false,
    isFeatured: true,
    isVisible: true,
    rating: 4.6,
    sold: 562,
    reviewCount: 34,
    specs: {
      ...DEFAULT_SPECS,
      handleMaterial: "Cán sắt hoặc cán gỗ (đồng bộ cả 5 dao trong combo)",
    },
    variants: [
      { id: "can-sat", label: "Cán Sắt", price: 1300000, stock: 8 },
      { id: "can-go", label: "Cán Gỗ", price: 1450000, stock: 7 },
    ],
  },
  {
    id: "da-mai-01",
    slug: "da-mai-dao-phuc-sen",
    name: "Đá Mài Dao Phúc Sen",
    category: "Đá mài",
    price: 120000,
    shortDescription: "Đá mài 2 mặt (thô/mịn) — giữ dao luôn bén như mới.",
    description:
      "Đá Mài Dao Phúc Sen 2 mặt (mặt thô để mài dao cùn, mặt mịn để lên nước bén hoàn thiện) — phụ kiện không thể thiếu để giữ dao rèn thủ công luôn sắc bén qua thời gian sử dụng lâu dài. Kèm hướng dẫn cách mài đúng kỹ thuật.",
    images: [IMG.bgForge],
    stock: 60,
    isSale: false,
    isBestSeller: false,
    isNew: true,
    isVisible: true,
    rating: 4.6,
    sold: 340,
    reviewCount: 22,
    specs: {
      steelType: "Không áp dụng (đá mài, không phải thép)",
      bladeLength: "—",
      handleLength: "—",
      thickness: "2 cạnh mài: thô & mịn",
      weight: "~300 gram",
      handleMaterial: "—",
      origin: "Làng rèn Phúc Sen, Quảng Uyên, Cao Bằng",
      warranty: "Đổi mới nếu lỗi sản xuất trong 30 ngày",
    },
    // Không có biến thể cán — sản phẩm phụ kiện, chỉ 1 phiên bản duy nhất.
  },
];

// ---------------------------------------------------------------------------
// Helper: lấy giá thấp nhất trong các biến thể (dùng làm giá hiển thị mặc định)
// ---------------------------------------------------------------------------
function normalizeProductPricing(p: Product): Product {
  if (!p.variants || p.variants.length === 0) return p;
  const cheapest = [...p.variants].sort(
    (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
  )[0];
  return { ...p, price: cheapest.price, salePrice: cheapest.salePrice };
}

export const allProducts: Product[] = products.map(normalizeProductPricing);

export async function getProductsByCategoryMock(slug: string): Promise<Product[]> {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return [];
  return allProducts.filter((p) => p.category === cat.name);
}

export async function getProductByIdMock(id: string): Promise<Product | undefined> {
  return allProducts.find((p) => p.id === id || p.slug === id);
}

export async function getRelatedProductsMock(product: Product, limit = 4): Promise<Product[]> {
  return allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

// ---- Accessors (mock data — được lib/catalog.ts ưu tiên thay bằng Google
// Sheets khi đã cấu hình; các trang server nên import từ lib/catalog) --------

export async function getBanners(): Promise<Banner[]> {
  return banners;
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getVouchersMock(): Promise<Voucher[]> {
  return vouchers;
}

export async function getNewProductsMock(limit = 8): Promise<Product[]> {
  return allProducts.filter((p) => p.isNew).slice(0, limit);
}

export async function getSaleProductsMock(limit = 8): Promise<Product[]> {
  return allProducts.filter((p) => p.isSale).slice(0, limit);
}

export async function getBestSellersMock(limit = 5): Promise<Product[]> {
  return allProducts.filter((p) => p.isBestSeller).slice(0, limit);
}

export function formatVND(value: number): string {
  return value.toLocaleString("vi-VN") + "₫";
}
