# Hướng dẫn thiết lập Google Sheets làm Database — Dao Phúc Sen

Website dùng Google Sheets làm "database" miễn phí, dễ chỉnh sửa bằng tay khi cần. Làm theo đúng thứ tự bên dưới.

## Bước 1 — Tạo Google Sheet

1. Vào [sheets.google.com](https://sheets.google.com) → **Tạo mới** một Spreadsheet, đặt tên ví dụ `DaoPhucSen-Database`.
2. Tạo đủ **7 tab (sheet)** với đúng tên và dòng tiêu đề (hàng 1) như sau:

### Tab `Products`

```
ID | Tên sản phẩm | Danh mục | Giá | Giá giảm | Mô tả | Ảnh 1 | Ảnh 2 | Ảnh 3 | Ảnh 4 | Ảnh 5 | Tồn kho | Sale | Best Seller | Mới | Màu sắc | Kích thước | Đánh giá | Đã bán | Slug | Mô tả ngắn | Hiển thị | Nổi bật | Số lượt đánh giá | Thông số kỹ thuật (JSON) | Tuỳ biến sản phẩm (JSON) | Video | Ghim lên đầu
```

Ghi chú các cột đặc biệt:
- **Màu sắc / Kích thước**: để trống — dao không dùng 2 cột này (giữ lại cho tương thích cấu trúc chung).
- **Slug**: đường dẫn URL, ví dụ `dao-chat-ga`. Nếu để trống, hệ thống tự lấy theo cột ID.
- **Hiển thị**: `TRUE`/`FALSE` — `FALSE` để ẩn sản phẩm khỏi website mà không cần xóa.
- **Thông số kỹ thuật (JSON)**: dán 1 chuỗi JSON, ví dụ:
  `{"steelType":"Thép nhíp đỏ Nga","bladeLength":"22 cm","handleLength":"13 cm","thickness":"3mm","weight":"550g","origin":"Phúc Sen, Cao Bằng","warranty":"6 tháng"}`
- **Tuỳ biến sản phẩm (JSON)**: dán 1 mảng JSON, `label` là tên tự đặt tự do (không giới hạn "Cán Sắt/Cán Gỗ" nữa), ví dụ:
  `[{"id":"cansat","label":"Cán Sắt","price":330000,"stock":20},{"id":"cango","label":"Cán Gỗ","price":360000,"stock":15}]`
  Để trống nếu sản phẩm chỉ có 1 phiên bản duy nhất (ví dụ đá mài). Nên tạo qua trang Admin thay vì gõ tay JSON.
- **Video** *(cột mới)*: link Youtube (`https://www.youtube.com/watch?v=...`) HOẶC URL video đã tải lên (Cloudinary) — điền qua trang Admin, không cần tự dán tay. Để trống nếu sản phẩm không có video. Video luôn hiển thị đầu tiên trong gallery ở trang chi tiết sản phẩm.
- **Ghim lên đầu** *(cột mới)*: `TRUE`/`FALSE` — `TRUE` để đưa sản phẩm lên đầu danh sách ở trang chủ, trang danh mục và kết quả tìm kiếm.

### Tab `Orders`

```
Mã đơn | Họ tên | SĐT | Email | Địa chỉ | Tỉnh/Thành phố | Phường/Xã | Sản phẩm | Số lượng | Tạm tính | Mã giảm giá | Phí vận chuyển | Tổng tiền | Phương thức thanh toán | Trạng thái | Ngày đặt | Ghi chú
```

Cột **Trạng thái** chỉ nhận 1 trong 5 giá trị: `Chờ xác nhận`, `Đã gọi`, `Đang giao`, `Hoàn thành`, `Đã hủy` — cập nhật qua trang `/admin/don-hang`.

### Tab `Vouchers`

```
Mã | Loại | Giá trị | Đơn tối thiểu | Mô tả | Kích hoạt | Ngày hết hạn | Độc quyền | Loại trừ Freeship
```

### Tab `ProductViews` (web tự ghi, không cần nhập tay)

```
Thời gian | Mã sản phẩm | Tên sản phẩm | Danh mục
```

### Tab `Reviews`

```
ID | Mã sản phẩm | Tên khách | Số sao | Bình luận | Ảnh | Ngày | Duyệt
```

### Tab `Posts` (Blog)

```
Slug | Tiêu đề | Mô tả ngắn | Nội dung (Markdown) | Ảnh bìa | Tác giả | Ngày đăng | Trạng thái (Published/Draft)
```

### Tab `Banners`

```
ID | Tiêu đề | Mô tả phụ | Ảnh | Nút chính | Nút phụ | Banner chính (TRUE/FALSE)
```

Chỉ nên đánh dấu `TRUE` ở đúng 1 dòng — banner đó sẽ hiển thị đầu tiên trên trang chủ.

## Bước 2 — Tạo Google Cloud Project + bật Sheets API

1. Vào [console.cloud.google.com](https://console.cloud.google.com) → tạo project mới (ví dụ `dao-phuc-sen`).
2. Vào **APIs & Services → Library**, tìm **Google Sheets API** → bấm **Enable**.

## Bước 3 — Tạo Service Account (tài khoản "robot" để đọc/ghi Sheet)

1. Vào **APIs & Services → Credentials → Create Credentials → Service Account**.
2. Đặt tên bất kỳ, ví dụ `daophucsen-sheets-bot`, bấm **Create and Continue** → **Done**.
3. Mở service account vừa tạo → tab **Keys → Add Key → Create new key → JSON**. File `.json` sẽ tự tải về máy — **giữ file này bí mật, không đưa lên GitHub public**.
4. Mở file JSON, bạn sẽ cần 2 giá trị:
   - `client_email` (dạng `xxx@xxx.iam.gserviceaccount.com`)
   - `private_key` (một chuỗi dài bắt đầu bằng `-----BEGIN PRIVATE KEY-----`)

## Bước 4 — Chia sẻ quyền chỉnh sửa Sheet cho Service Account

1. Mở lại Google Sheet `DaoPhucSen-Database` → bấm **Share**.
2. Dán `client_email` ở trên vào ô chia sẻ, chọn quyền **Editor** → **Send**.

(Đây là bước rất dễ quên — thiếu bước này API sẽ báo lỗi 403 permission denied.)

## Bước 5 — Khai báo biến môi trường

Sao chép `.env.example` thành `.env.local` rồi điền:

```env
GOOGLE_SHEET_ID=                      ← ID trong URL Google Sheet của bạn
GOOGLE_SERVICE_ACCOUNT_EMAIL=         ← client_email từ file JSON ở Bước 3
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

ADMIN_PASSWORD=                       ← đặt mật khẩu đăng nhập trang /admin

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NEXT_PUBLIC_SITE_URL=https://langdaophucsencaobang.shop
NEXT_PUBLIC_GA_ID=                    ← Google Analytics 4 (tuỳ chọn)
NEXT_PUBLIC_GTM_ID=                   ← Google Tag Manager (tuỳ chọn)
```

> Lưu ý: giữ nguyên các ký tự `\n` trong private key, để trong dấu ngoặc kép.

## Bước 6 — Cài thư viện

```bash
npm install
```

`googleapis` và `cloudinary` đã nằm sẵn trong dependencies.

## Bước 7 — Kết nối đã được viết sẵn trong code

Không cần viết lại — khi 3 biến `GOOGLE_SHEET_ID` / `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY` được cấu hình đầy đủ, `lib/catalog.ts` và các trang Admin sẽ **tự động** đọc/ghi trực tiếp vào Sheet thay vì dùng dữ liệu mẫu trong `lib/data.ts`. Nếu Sheets có sự cố (mất mạng, sai quyền...), trang web tự động rơi về dữ liệu mẫu để không bao giờ hiển thị trang trắng.

Chi tiết cách quản lý sản phẩm, biến thể cán sắt/cán gỗ, và các trang Admin: xem file **`HUONG_DAN_QUAN_LY_SAN_PHAM.md`**.
