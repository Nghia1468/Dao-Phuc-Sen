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
- Sẵn chỗ gắn Google Analytics 4 / Google Tag Manager (`components/seo/AnalyticsScripts.tsx`).

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
NEXT_PUBLIC_GA_ID=                     # Google Analytics 4 Measurement ID (tuỳ chọn)
NEXT_PUBLIC_GTM_ID=                    # Google Tag Manager Container ID (tuỳ chọn)
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
  cart-context.tsx Giỏ hàng — hỗ trợ biến thể cán sắt/cán gỗ (giá riêng từng dòng)
  vouchers.ts      Lớp trung gian Vouchers
  reviews.ts       Lớp trung gian Reviews
  blog.ts          Lớp trung gian Blog Posts
  googleSheets.ts  CRUD toàn bộ Google Sheets (Products/Orders/Banners/Vouchers/Reviews/Posts)
  schema.ts        JSON-LD Schema.org
  seo.ts           Cấu hình SEO/Google Business trung tâm
  cloudinary.ts    Upload ảnh
components/
  ProductDetailView.tsx   Chọn biến thể cán sắt/cán gỗ + bảng thông số kỹ thuật
  seo/                    JsonLd, AnalyticsScripts (GA4/GTM)
  admin/                  Form Thêm/Sửa (Sản phẩm, Banner, Voucher, Bài viết)
```

Có câu hỏi hoặc muốn phát triển thêm phần nào, cứ trao đổi tiếp.
