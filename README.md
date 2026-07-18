# Dao Phúc Sen — Website Dao Rèn Thủ Công Cao Bằng

Website thương mại điện tử bán dao rèn thủ công làng nghề Phúc Sen (Cao Bằng), chuyển đổi từ nền tảng Next.js gốc (trước đây dùng cho một website trang sức), giữ nguyên toàn bộ kiến trúc — chỉ đổi thương hiệu, dữ liệu và nghiệp vụ sang dao.

> ⚠️ **Lưu ý quan trọng về công nghệ**: Website dùng **Next.js 15 (App Router) + TypeScript + TailwindCSS**, không dùng Bootstrap. Có dùng **API Route + Middleware + Server Component** (đăng nhập Admin, ghi Google Sheets, upload Cloudinary...) nên **không thể host tĩnh 100% trên GitHub Pages**. Khuyến nghị deploy trên **Vercel** (miễn phí, hỗ trợ đầy đủ mọi tính năng của dự án) hoặc VPS Node.js.

## 1. Giới thiệu dự án

Dao Phúc Sen là website bán dao bếp rèn thủ công (dao chặt, dao thái, dao bầu, dao lọc, combo, đá mài), mỗi loại dao có 2 biến thể **cán sắt / cán gỗ** với giá riêng. Website vận hành được ngay: quản lý sản phẩm/đơn hàng/khách hàng/banner/mã giảm giá/đánh giá/bài viết qua trang Admin (không cần biết code), đơn hàng lưu vào Google Sheets, tối ưu sẵn cho SEO.

**Demo:** _(điền link sau khi deploy, ví dụ `https://langdaophucsencaobang.vercel.app`)_

## 2. Công nghệ sử dụng

| Nhóm | Công nghệ |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Giao diện | TailwindCSS, Framer Motion (hiệu ứng), Swiper (slider) |
| Dữ liệu | Google Sheets (Products, Orders, Vouchers, ProductViews, Reviews, Posts, Banners) qua Google Sheets API |
| Ảnh | Cloudinary (upload trực tiếp từ trang Admin) |
| Nội dung Blog | Markdown, render bằng thư viện `marked` |
| SEO | Metadata API của Next.js (Title/OG/Twitter/Canonical riêng từng trang), Schema.org JSON-LD, `sitemap.xml` & `robots.txt` tự sinh |
| Xác thực Admin | Mật khẩu đơn + cookie httpOnly + `middleware.ts` |

## 3. Chức năng

**Khách hàng**
- Trang chủ: Hero Banner slideshow (quản lý qua Admin), 5 danh mục (Dao chặt/Dao thái/Dao bầu-lọc/Combo/Đá mài), sản phẩm mới, mã giảm giá, Flash Sale, Top bán chạy.
- Trang danh mục: lưới sản phẩm, lọc theo giá/mới/bán chạy/giảm giá/còn hàng, sắp xếp.
- Trang chi tiết sản phẩm: gallery zoom, **chọn biến thể Cán Sắt / Cán Gỗ (giá đổi theo lựa chọn)**, bảng thông số kỹ thuật (loại thép, chiều dài lưỡi/cán, độ dày, trọng lượng, xuất xứ, bảo hành), đánh giá sao thật kèm ảnh khách hàng, sản phẩm liên quan, Schema Product cho Rich Results.
- Giỏ hàng: có thể đặt cùng lúc cả cán sắt và cán gỗ của cùng 1 dao (2 dòng riêng biệt).
- Thanh toán: nhập địa chỉ Tỉnh/Thành → Phường/Xã, áp mã giảm giá + mã freeship, popup "Chọn mã giảm giá".
- Blog: 4 bài viết (cách chọn dao, cách mài dao, cách bảo quản dao, giới thiệu làng rèn Phúc Sen), Schema Article.
- Trang giới thiệu: lịch sử làng rèn, nghệ nhân, quy trình rèn, video.
- FAQ: accordion, Schema FAQPage.

**Trang quản trị** (`/admin`)
- Dashboard: Tổng sản phẩm, Tổng đơn hàng, Doanh thu, Sản phẩm bán chạy nhất + thống kê lượt xem.
- Quản lý sản phẩm: Thêm/Sửa/Xóa/Ẩn-hiện, upload ảnh Cloudinary, **thông số kỹ thuật + biến thể cán sắt/cán gỗ (mỗi loại 1 giá + tồn kho riêng)**.
- Quản lý đơn hàng: xem danh sách, lọc theo trạng thái (Chờ xác nhận / Đã gọi / Đang giao / Hoàn thành / Đã hủy), cập nhật trạng thái + ghi chú nội bộ.
- Quản lý khách hàng: tự động gom nhóm theo SĐT từ lịch sử đơn hàng — tên, SĐT, địa chỉ, tổng chi tiêu, lịch sử mua hàng.
- Quản lý banner: Thêm/Sửa/Xóa, upload ảnh, chọn 1 banner làm banner chính hiển thị đầu trang chủ.
- Quản lý mã giảm giá: loại (%, tiền cố định, freeship), đơn tối thiểu, độc quyền, ngày hết hạn.
- Quản lý đánh giá: duyệt/ẩn/xóa đánh giá khách gửi lên (kèm ảnh thực tế).
- Quản lý bài viết: viết/sửa bài Markdown, ảnh bìa, nháp/xuất bản.

**SEO & hiệu năng**
- Mỗi trang có Title/Description/Canonical/OG/Twitter Card riêng (`generateMetadata`).
- Schema.org: Organization, LocalBusiness (HardwareStore), Product + Review, FAQPage, Article, BreadcrumbList.
- `sitemap.xml` và `robots.txt` tự sinh từ dữ liệu thật (sản phẩm, danh mục, bài viết).
- ISR cache 30 giây cho trang chủ/danh mục/sản phẩm.
- `next/image` tự tối ưu ảnh sang WebP/AVIF + lazy load; ảnh Hero dùng `priority`.
- Tracking Ecommerce chuẩn GA4 qua Google Tag Manager (xem mục 7) — không ảnh hưởng SEO/hiệu năng, không lỗi hydration.

## 4. Hướng dẫn chạy dự án

```bash
npm install
cp .env.example .env.local   # rồi điền theo hướng dẫn bên dưới
npm run dev
```

Mở `http://localhost:3000`.

### Biến môi trường cần điền (`.env.local`)

```env
GOOGLE_SHEET_ID=...                    # ID Google Sheet dùng làm database
GOOGLE_SERVICE_ACCOUNT_EMAIL=...       # Email Service Account (xem GOOGLE_SHEETS_SETUP.md)
GOOGLE_PRIVATE_KEY="..."               # Private Key của Service Account

ADMIN_PASSWORD=...                     # Mật khẩu đăng nhập /admin — đổi trước khi deploy thật

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...              # Dùng để upload ảnh sản phẩm/banner

NEXT_PUBLIC_SITE_URL=https://langdaophucsencaobang.shop
NEXT_PUBLIC_GTM_ID=                    # Google Tag Manager Container ID — MỌI tracking đi qua đây
NEXT_PUBLIC_GA_ID=                     # GA4 Measurement ID — dùng để tạo GA4 Tag BÊN TRONG GTM, không nhúng trực tiếp
NEXT_PUBLIC_FB_PIXEL_ID=               # Meta Pixel ID — dùng để tạo Meta Pixel Tag BÊN TRONG GTM, không nhúng trực tiếp
```

Hướng dẫn chi tiết cấu hình Google Sheets (Service Account, cấu trúc từng tab): xem **`GOOGLE_SHEETS_SETUP.md`** và **`HUONG_DAN_QUAN_LY_SAN_PHAM.md`**.

### Build production

```bash
npm run build
npm run start
```

## 5. Kết nối Google Search Console / Google Business Profile

1. Deploy website lên domain thật → [Google Search Console](https://search.google.com/search-console) → thêm thuộc tính → khai báo sitemap `/sitemap.xml`.
2. Thông tin liên hệ (địa chỉ, SĐT, giờ làm việc) hiển thị ở Footer và Schema `LocalBusiness` lấy từ **`lib/seo.ts`** — sửa đúng thông tin thật ở đó, đảm bảo khớp với Google Business Profile.

## 6. Cấu trúc thư mục (rút gọn)

```
app/
  page.tsx                    Trang chủ
  danh-muc/[slug]/            Trang danh mục
  san-pham/[id]/              Trang chi tiết sản phẩm
  sale/, thanh-toan/, blog/, faq/, gioi-thieu/
  admin/                      Dashboard, Sản phẩm, Đơn hàng, Khách hàng, Banner, Mã giảm giá, Đánh giá, Bài viết
  api/                        API Routes (đơn hàng, voucher, review, upload, admin CRUD)
  sitemap.ts, robots.ts       SEO tự sinh
lib/
  data.ts          Dữ liệu mẫu + types (Product, ProductVariant, ProductSpecs...)
  catalog.ts       Lớp trung gian Products + Banners (Sheets ⇄ mock)
  cart-context.tsx Giỏ hàng — hỗ trợ biến thể cán sắt/cán gỗ (giá riêng từng dòng) + bắn add_to_cart
  vouchers.ts      Lớp trung gian Vouchers
  reviews.ts       Lớp trung gian Reviews
  blog.ts          Lớp trung gian Blog Posts
  googleSheets.ts  CRUD toàn bộ Google Sheets (Products/Orders/Banners/Vouchers/Reviews/Posts)
  schema.ts        JSON-LD Schema.org
  seo.ts           Cấu hình SEO/Google Business trung tâm (gồm cả GA_ID/GTM_ID/FB_PIXEL_ID)
  cloudinary.ts    Upload ảnh
  tracking.ts      Module DUY NHẤT được phép push window.dataLayer (GA4 Ecommerce + Meta Pixel qua GTM)
components/
  ProductDetailView.tsx   Chọn biến thể cán sắt/cán gỗ + bảng thông số kỹ thuật + bắn view_item
  SocialProof.tsx         Popup "vừa mua" + popup đánh giá, xen kẽ ngẫu nhiên
  seo/                    JsonLd, AnalyticsScripts (chỉ nhúng GTM), RouteChangeTracker (virtual pageview SPA)
  admin/                  Form Thêm/Sửa (Sản phẩm, Banner, Voucher, Bài viết)
app/api/social-proof/     API tổng hợp dữ liệu popup Social Proof (sản phẩm thật + Reviews đã duyệt)
```

## 7. Tracking Ecommerce (GA4 + Google Ads + Meta Pixel qua GTM)

### 7.1. Kiến trúc

```
Website (Next.js)
   │  window.dataLayer.push(...)   ← DUY NHẤT qua lib/tracking.ts
   ▼
Google Tag Manager (GTM-XXXXXXX)
   │
   ├──▶ GA4 Configuration Tag  ──▶ GA4 Property  ──▶ Google Ads (Import conversion)
   │
   └──▶ Meta Pixel Tag         ──▶ Meta Events Manager
```

- Website **chỉ nhúng GTM** (`components/seo/AnalyticsScripts.tsx`) — không nhúng `gtag.js`, không nhúng Meta Pixel script trực tiếp. GA4 và Meta Pixel được cấu hình **bên trong GTM** (Tag Manager UI), không trong code.
- Toàn bộ event dùng `window.dataLayer.push()` theo đúng tên chuẩn GA4, tập trung 100% ở **`lib/tracking.ts`** — không có chỗ nào khác trong code được phép gọi `dataLayer.push` trực tiếp (dễ kiểm soát, không trùng lặp, dễ mở rộng thêm event mới).
- ID (`NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_FB_PIXEL_ID`) luôn đọc qua `process.env`, không hardcode. `GA_ID`/`FB_PIXEL_ID` còn được đẩy sẵn vào `dataLayer` (biến `ga_id`, `fb_pixel_id`) TRƯỚC khi GTM khởi tạo, để trong GTM tạo Data Layer Variable đọc ra — không cần gõ tay ID vào GTM UI.

### 7.2. Danh sách Event & dữ liệu gửi

| Event (GA4) | Khi nào bắn | Nơi gọi | Dữ liệu gửi |
|---|---|---|---|
| `view_item` | Mở trang chi tiết sản phẩm | `components/ProductDetailView.tsx` (useEffect khi đổi `product.id`) | `currency`, `value`, `items: [{item_id, item_name, item_category, price, quantity:1}]` |
| `add_to_cart` | Bấm "Thêm vào giỏ hàng" **hoặc** "Mua ngay" (mọi nút, mọi trang) | `lib/cart-context.tsx` → hàm `addItem()` — **điểm chạm DUY NHẤT**, mọi nút gọi vào đây nên không bao giờ bắn trùng | `currency`, `value`, `items: [{item_id, item_name, item_category, price, quantity}]` |
| `begin_checkout` | Vào trang `/thanh-toan` (từ "Mua ngay" hoặc "Thanh toán" ở giỏ hàng) | `app/thanh-toan/page.tsx` (useEffect, chỉ 1 lần/lượt vào trang, bỏ qua nếu giỏ trống) | `currency`, `value` (tạm tính), `items: [...]` |
| `purchase` | **Chỉ** khi `/api/orders` trả về thành công (đã ghi Google Sheets) | `app/thanh-toan/page.tsx` (trong `handleSubmit`, nhánh thành công — KHÔNG bắn nếu API lỗi, KHÔNG bắn ở trang cảm ơn nên F5 không bị đếm lại) | `transaction_id`, `currency`, `value` (tổng), `shipping`, `tax`, `coupon`, `items: [...]` |
| `generate_lead` | Bấm số điện thoại hoặc Zalo ở Footer | `components/Footer.tsx` | `lead_source: "phone" \| "zalo"` |
| `page_view` (ảo) | Mỗi lần chuyển trang phía client (App Router không reload) | `components/seo/RouteChangeTracker.tsx` | `page_location`, `page_path`, `page_title` |

### 7.3. Mapping GA4 → Meta Pixel (cấu hình trong GTM, không phải code)

| dataLayer event | GA4 | Meta Pixel |
|---|---|---|
| `view_item` | `view_item` | `ViewContent` |
| `add_to_cart` | `add_to_cart` | `AddToCart` |
| `begin_checkout` | `begin_checkout` | `InitiateCheckout` |
| `purchase` | `purchase` | `Purchase` |
| `generate_lead` | `generate_lead` | `Lead` |

### 7.4. Thiết lập trong GTM (làm 1 lần, ngoài code)

1. Tạo **Biến** → Data Layer Variable: `DLV - fb_pixel_id`, `DLV - ga_id`, và các biến ecommerce chuẩn (`DLV - ecommerce.value`, `DLV - ecommerce.items`, v.v. — dùng Variable kiểu "Data Layer Variable" với tên `ecommerce.items`...).
2. Tạo **Tag** GA4 Configuration → Measurement ID = `{{DLV - ga_id}}` → Trigger "All Pages" nhưng **tắt** "Send a page view event when this configuration loads" (vì đã có `page_view` ảo riêng ở mục 7.2).
3. Tạo 5 **Tag** GA4 Event (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `generate_lead`) + 1 Tag GA4 Event tên `page_view` → mỗi tag Trigger = Custom Event đúng tên tương ứng, gắn các trường ecommerce từ Data Layer Variable.
4. Tạo Tag **Meta Pixel — Base Code** (Pixel ID = `{{DLV - fb_pixel_id}}`) → Trigger "All Pages", **Tag Sequencing**: chỉ fire 1 lần (Once per page) để không duplicate PageView khi điều hướng SPA — Tag riêng cho `page_view` ảo gọi `fbq('track','PageView')` ở Trigger Custom Event `page_view` (bỏ qua lần đầu vì Base Code đã bắn).
5. Tạo 5 Tag Meta Pixel Event (`ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Lead`) tương ứng Trigger Custom Event ở bảng 7.3.
6. **Google Ads**: vào GA4 → Admin → "Google Ads Linking" → liên kết tài khoản Ads → Admin → "Conversions" → Import `purchase`, `add_to_cart`, `begin_checkout` từ GA4 (không tạo thẻ Website Conversion `AW-xxxx` riêng theo đúng yêu cầu).
7. **Meta Conversions API (CAPI)** sau này: chỉ cần thêm Tag CAPI phía GTM Server-side (hoặc qua đối tác), **không cần sửa code tracking hiện tại** — vì mọi dữ liệu đã có sẵn trong `dataLayer` đúng chuẩn GA4 Ecommerce.

### 7.5. Cách kiểm tra

- **Google Tag Assistant** (extension Chrome): mở site → bấm icon → "Connect" → thao tác trên site (xem sản phẩm/thêm giỏ/đặt hàng) → xem tag GTM có fire đúng thứ tự, đúng biến không.
- **GA4 DebugView**: bật chế độ debug bằng extension "Google Analytics Debugger", hoặc thêm `?gtm_debug=x` khi preview trong GTM → vào GA4 → Admin → DebugView → xem event realtime kèm tham số.
- **Facebook Pixel Helper** (extension Chrome): mở site → icon chuyển xanh + hiện đúng Pixel ID → thao tác trên site → xem đúng sự kiện `PageView/ViewContent/AddToCart/InitiateCheckout/Purchase/Lead` fire, không bị nhân đôi.
- **Kiểm tra từng event thủ công** (mở Console → gõ `window.dataLayer` để xem toàn bộ log đã push):
  - `view_item`: mở bất kỳ trang `/san-pham/[id]`.
  - `add_to_cart`: bấm "Thêm vào giỏ hàng" ở thẻ sản phẩm/trang chi tiết, hoặc "Mua ngay".
  - `begin_checkout`: từ giỏ hàng bấm "Thanh toán" (hoặc "Mua ngay" thẳng từ sản phẩm).
  - `purchase`: điền form và đặt hàng thành công tới trang "Đặt hàng thành công" — F5 lại trang đó **không** bắn thêm lần 2 (chặn bằng `sessionStorage` theo `transaction_id`).
  - `generate_lead`: bấm số điện thoại hoặc icon Zalo ở Footer.
  - `page_view`: điều hướng giữa các trang (không F5) — mỗi lần đổi URL phải thấy 1 dòng `page_view` mới trong `dataLayer`.

## 8. Social Proof (popup "vừa mua" + popup đánh giá)

- **API** `app/api/social-proof/route.ts`: ghép ngẫu nhiên tên khách (danh sách mẫu) với **sản phẩm thật** lấy từ `getCatalog()` cho popup "vừa mua"; đọc **đánh giá đã duyệt thật** từ Sheet "Reviews" cho popup đánh giá (nếu chưa có đánh giá nào, dùng dữ liệu mẫu để không hiện popup trống). Cache 60s (`revalidate`), không gọi Google Sheets liên tục.
- **Component** `components/SocialProof.tsx`: fetch dữ liệu 1 lần lúc mount (client-only, không ảnh hưởng SSR/SEO) → hiển thị ngẫu nhiên sau mỗi **30–60 giây**, hiện **6 giây** rồi tự ẩn (Fade In/Out bằng Framer Motion), 2 loại xen kẽ tự nhiên theo thứ tự dữ liệu trả về từ API (không lặp liên tiếp cùng 1 đánh giá).
- **Vị trí**: góc trái dưới trên Desktop, góc trên (full-width, thu gọn) trên Mobile — theo đúng yêu cầu, có nút đóng (X), bấm vào popup dẫn tới trang sản phẩm liên quan.
- Không có ảnh sản phẩm → hiện icon dao (`PocketKnife` từ `lucide-react`) thay thế.

## 9. Danh sách file đã tạo mới / chỉnh sửa (đợt triển khai Tracking + Social Proof)

**File tạo mới**
| File | Mục đích |
|---|---|
| `lib/tracking.ts` | Module trung tâm push `window.dataLayer` — toàn bộ event GA4 Ecommerce |
| `components/seo/RouteChangeTracker.tsx` | Bắn `page_view` ảo mỗi khi chuyển route (SPA), không duplicate lần tải đầu |
| `components/SocialProof.tsx` | Popup "vừa mua" + popup đánh giá, xen kẽ ngẫu nhiên |
| `app/api/social-proof/route.ts` | API tổng hợp dữ liệu cho Social Proof (sản phẩm thật + Reviews đã duyệt) |

**File chỉnh sửa**
| File | Thay đổi |
|---|---|
| `components/seo/AnalyticsScripts.tsx` | Bỏ nhúng `gtag.js` trực tiếp — chỉ còn nhúng GTM; đẩy `ga_id`/`fb_pixel_id` vào `dataLayer` trước khi GTM khởi tạo |
| `lib/seo.ts` | Thêm `fbPixelId` đọc từ `NEXT_PUBLIC_FB_PIXEL_ID` |
| `app/layout.tsx` | Gắn `RouteChangeTracker` + `SocialProof` vào layout gốc |
| `lib/cart-context.tsx` | Bắn `add_to_cart` ngay trong `addItem()` — điểm chạm duy nhất |
| `components/ProductDetailView.tsx` | Bắn `view_item` khi mở trang chi tiết sản phẩm |
| `app/thanh-toan/page.tsx` | Bắn `begin_checkout` khi vào trang; bắn `purchase` khi đặt hàng thành công |
| `components/Footer.tsx` | Bắn `generate_lead` khi bấm số điện thoại / Zalo |
| `.env.example` | Thêm `NEXT_PUBLIC_FB_PIXEL_ID`; **thay toàn bộ giá trị mẫu bằng placeholder** (file cũ vô tình chứa secret thật — xem cảnh báo bảo mật bên dưới) |
| `README.md` | Thêm mục 7 (Tracking Ecommerce) và mục 8 (Social Proof) |

> ⚠️ **Cảnh báo bảo mật**: file `.env.example` trước đây chứa **Private Key Google thật, Cloudinary Secret thật, mật khẩu Admin thật** — nếu file này từng được đẩy lên Git (kể cả repo private), các khóa đó coi như đã lộ. Cần **thu hồi/tạo lại Service Account key mới**, **đổi Cloudinary API Secret**, và **đổi `ADMIN_PASSWORD`** càng sớm càng tốt, sau đó chỉ commit `.env.example` (placeholder) — không bao giờ commit `.env.local`.

Có câu hỏi hoặc muốn phát triển thêm phần nào, cứ trao đổi tiếp.
