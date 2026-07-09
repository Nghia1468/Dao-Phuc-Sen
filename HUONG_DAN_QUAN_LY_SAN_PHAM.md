# Hướng dẫn: Lấy dữ liệu từ Google Sheets & Quản lý sản phẩm (Thêm/Sửa/Xóa)

File này trả lời 3 câu hỏi:
1. Làm sao lấy dữ liệu từ Google Sheet vào web?
2. Thêm/sửa/xóa sản phẩm (kèm biến thể cán sắt/cán gỗ) bằng cách nào?
3. Cột "Thông số kỹ thuật" và "Biến thể cán" hoạt động ra sao?

---

## 1. Tổng quan cách dữ liệu chạy trong hệ thống

```
Google Sheet "Products"
        │  (đọc bằng Service Account)
        ▼
lib/googleSheets.ts   → hàm readProducts(), createProduct(), updateProductRow(), deleteProductRow()
        │
        ▼
lib/catalog.ts        → getNewProducts(), getProductsByCategory(), getProductById()...
        │                 (tự cache 30 giây, tự fallback về dữ liệu mẫu nếu Sheets lỗi)
        ▼
Các trang web (/,  /danh-muc/[slug],  /san-pham/[id],  /sale)
```

```
Trang /admin/san-pham (giao diện quản trị)
        │  (thêm/sửa/xóa qua form)
        ▼
API /api/admin/products, /api/admin/products/[id]
        │
        ▼
lib/googleSheets.ts → ghi thẳng vào Google Sheet + xóa cache (invalidateCatalogCache)
        │
        ▼
Web tự động hiển thị dữ liệu mới (chậm nhất 30 giây, hoặc ngay lập tức nếu vào lại trang sau khi Admin lưu)
```

Bạn **không cần sửa code** để lấy dữ liệu — chỉ cần cấu hình đúng 3 biến môi trường ở Bước 2, hệ thống sẽ tự chuyển từ dữ liệu mẫu (mock) sang dữ liệu thật trong Sheet.

---

## 2. Cấu hình kết nối tới đúng Sheet của bạn

### 2.1. Sheet ID

Mở Google Sheet của bạn, lấy phần ID trong URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_CUA_BAN/edit
```
→ Dán `SHEET_ID_CUA_BAN` vào biến `GOOGLE_SHEET_ID` trong `.env.local`.

### 2.2. Tạo Service Account (bắt buộc — Sheet của bạn đang ở chế độ riêng tư)

Web không thể "xem" Google Sheet như trình duyệt của bạn — nó cần một tài khoản robot (Service Account) được bạn cấp quyền Editor trên Sheet đó. Làm theo đúng các bước trong file **`GOOGLE_SHEETS_SETUP.md`** (đã có sẵn trong dự án). Tóm tắt nhanh:

1. Vào [console.cloud.google.com](https://console.cloud.google.com) → tạo project → bật **Google Sheets API**.
2. Tạo **Service Account** → tạo **Key JSON** → lấy `client_email` và `private_key`.
3. Mở Sheet của bạn → **Share** → dán `client_email` → chọn quyền **Editor**.
4. Copy `.env.example` thành `.env.local`, điền:

```env
GOOGLE_SHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_PASSWORD=đặt-mật-khẩu-mạnh-ở-đây
```

5. Chạy lại `npm run dev`. Nếu 3 biến `GOOGLE_*` đã đúng, trang chủ/danh mục/chi tiết sản phẩm sẽ **tự động đọc dữ liệu thật từ Sheet** thay vì dữ liệu mẫu — không cần đổi code.

> Nếu chưa điền hoặc điền sai, web tự động dùng lại dữ liệu mẫu (không bị lỗi trắng trang) và log cảnh báo trong terminal.

---

## 3. Cấu trúc Sheet "Products" mà web yêu cầu

Đổi **hàng 1** của Sheet "Products" thành đúng 26 cột theo thứ tự này (A → Z):

| Cột | Tên cột | Bắt buộc? | Ghi chú |
|---|---|---|---|
| A | ID | ✅ | Duy nhất, không dấu, không trùng. Ví dụ: `dao-chat-ga` |
| B | Tên sản phẩm | ✅ | |
| C | Danh mục | ✅ | Phải là 1 trong: `Dao chặt`, `Dao thái`, `Dao bầu`, `Dao lọc`, `Combo`, `Đá mài` |
| D | Giá | ✅ | Số, đơn vị đồng, không có dấu phẩy/chấm |
| E | Giá giảm | ⬜ | Để trống nếu không giảm giá |
| F | Mô tả | ⬜ | |
| G | Ảnh 1 | ✅ | URL ảnh (upload lên Cloudinary qua nút "Tải ảnh" trong Admin, hoặc dán link công khai) |
| H | Ảnh 2 | ⬜ | |
| I | Ảnh 3 | ⬜ | |
| J | Ảnh 4 | ⬜ | |
| K | Ảnh 5 | ⬜ | |
| L | Tồn kho | ✅ | Số nguyên |
| M | Sale | ⬜ | `TRUE` hoặc `FALSE` |
| N | Best Seller | ⬜ | `TRUE` hoặc `FALSE` |
| O | Mới | ⬜ | `TRUE` hoặc `FALSE` |
| P | Màu sắc | ⬜ | Không dùng cho dao — luôn để trống |
| Q | Kích thước | ⬜ | Không dùng cho dao — luôn để trống |
| R | Đánh giá | ⬜ | Số từ 0–5, ví dụ `4.8` |
| S | Đã bán | ⬜ | Số lượng đã bán |
| **T** | **Slug** | ⬜ | Đường dẫn URL, ví dụ `dao-chat-ga`. Để trống thì web tự lấy theo cột ID |
| **U** | **Mô tả ngắn** | ⬜ | Hiển thị ở danh sách sản phẩm |
| **V** | **Hiển thị** | ⬜ | `TRUE`/`FALSE` — để trống = mặc định hiển thị. `FALSE` để ẩn tạm sản phẩm khỏi web |
| **W** | **Nổi bật** | ⬜ | `TRUE`/`FALSE` |
| **X** | **Số lượt đánh giá** | ⬜ | Số nguyên |
| **Y** | **Thông số kỹ thuật (JSON)** | ⬜ | Xem mục 4 bên dưới |
| **Z** | **Biến thể cán (JSON)** | ⬜ | Xem mục 4 bên dưới |

**Ví dụ 1 dòng dữ liệu (hàng 2) — dao có 2 biến thể cán:**

```
dao-chat-ga | Dao Chặt Gà | Dao chặt | 330000 | | Dao chặt gà rèn thủ công... | https://...jpg | | | | | 40 | FALSE | TRUE | TRUE | | | 4.9 | 2240 | dao-chat-ga | Dao chặt gà, vịt rèn thủ công | TRUE | TRUE | 128 | {"steelType":"Thép nhíp đỏ Nga","bladeLength":"22-23cm","warranty":"6 tháng"} | [{"handleType":"can-sat","label":"Cán Sắt","price":330000,"stock":22},{"handleType":"can-go","label":"Cán Gỗ","price":360000,"stock":18}]
```

**Ví dụ 1 dòng không có biến thể (đá mài — chỉ 1 phiên bản):**

```
da-mai-01 | Đá Mài Dao Phúc Sen | Đá mài | 120000 | | Đá mài 2 mặt... | https://...jpg | | | | | 60 | FALSE | FALSE | TRUE | | | 4.6 | 340 | da-mai-dao-phuc-sen | Đá mài 2 mặt thô/mịn | TRUE | FALSE | 22 | {} |
```
→ Cột **Z (Biến thể cán)** để **trống**.

---

## 3.1. Sheet "Vouchers" (mã giảm giá) — mới thêm

Tạo thêm 1 tab tên `Vouchers`, hàng 1 là tiêu đề:

```
Mã | Loại | Giá trị | Đơn tối thiểu | Mô tả | Kích hoạt | Ngày hết hạn
```

| Cột | Ý nghĩa | Ví dụ |
|---|---|---|
| Mã | Mã khách nhập lúc thanh toán | `SALE10` |
| Loại | `percent` (giảm %) / `fixed` (giảm số tiền cố định) / `freeship` (miễn phí ship) | `percent` |
| Giá trị | Số % hoặc số tiền — bỏ qua nếu `freeship` | `10` |
| Đơn tối thiểu | Đơn hàng phải đạt tối thiểu bằng số này (đồng) mới áp dụng được — **đây chính là điều kiện trước đây bị thiếu khiến đơn dưới 300k vẫn áp mã được, giờ đã bắt buộc** | `300000` |
| Mô tả | Dòng chữ hiển thị ở khu vực mã giảm giá trang chủ | `Giảm 10% cho đơn từ 300.000₫` |
| Kích hoạt | `TRUE`/`FALSE` — tắt mã mà không cần xóa | `TRUE` |
| Ngày hết hạn | `YYYY-MM-DD`, để trống nếu không giới hạn | `2026-12-31` |

**Ví dụ dữ liệu:**
```
SALE10 | percent | 10 | 300000 | Giảm 10% cho đơn từ 300.000₫ | TRUE |
SALE15 | percent | 15 | 500000 | Giảm 15% cho đơn từ 500.000₫ | TRUE |
FREESHIP | freeship | 0 | 0 | Miễn phí vận chuyển toàn quốc | TRUE |
```

Quản lý mã giảm giá dễ dàng hơn qua giao diện tại `/admin/ma-giam-gia` — không cần vào Sheet sửa tay.

## 3.2. Sheet "ProductViews" (lượt xem sản phẩm) — mới thêm

Tạo thêm 1 tab tên `ProductViews`, hàng 1 là tiêu đề:

```
Thời gian | Mã sản phẩm | Tên sản phẩm | Danh mục
```

Web **tự động ghi** 1 dòng vào tab này mỗi khi có khách mở trang chi tiết 1 sản phẩm — bạn không cần nhập tay. Dashboard Admin (`/admin`) đọc tab này để hiển thị: tổng lượt xem, top sản phẩm được xem nhiều nhất, hoạt động gần đây.

## 3.3. Sheet "Reviews" (đánh giá khách hàng) — mới thêm

Tạo thêm 1 tab tên `Reviews`, hàng 1 là tiêu đề:

```
ID | Mã sản phẩm | Tên khách | Số sao | Bình luận | Ảnh | Ngày | Duyệt
```

- Khách gửi đánh giá công khai từ tab "Đánh giá" ở trang chi tiết sản phẩm → web tự ghi 1 dòng với **Duyệt = FALSE** (chưa hiển thị công khai).
- Vào `/admin/danh-gia` để duyệt (hoặc xóa) — chỉ đánh giá có **Duyệt = TRUE** mới hiển thị công khai và được đưa vào Schema Review/AggregateRating của sản phẩm.
- Cột "Ảnh" là URL ảnh thực tế khách gửi kèm (tự động upload qua Cloudinary khi khách chọn ảnh).

## 3.4. Sheet "Posts" (Blog) — mới thêm

Tạo thêm 1 tab tên `Posts`, hàng 1 là tiêu đề:

```
Slug | Tiêu đề | Mô tả ngắn | Nội dung | Ảnh bìa | Tác giả | Ngày đăng | Trạng thái
```

- **Nội dung** viết theo cú pháp Markdown (`## Tiêu đề phụ`, `**đậm**`, `- danh sách`...), web tự render ra HTML đẹp ở trang `/blog/[slug]`.
- **Trạng thái**: `Published` (hiển thị công khai) hoặc `Draft` (nháp, chỉ thấy trong Admin).
- Quản lý toàn bộ qua `/admin/bai-viet` — không cần vào Sheet sửa tay, kể cả chèn ảnh vào giữa bài viết (nút "Chèn ảnh vào nội dung" tự upload Cloudinary và chèn đúng vị trí con trỏ).

---

## 4. Cột "Thông số kỹ thuật" và "Biến thể cán" hoạt động ra sao?

Thay vì tạo hẳn 1 Sheet phụ riêng cho biến thể (phức tạp hơn nhiều để quản lý bằng tay), 2 cột **Y** và **Z** dùng định dạng JSON gọn trong 1 ô — vẫn sửa được trực tiếp trên Sheet, nhưng dễ dùng nhất là qua trang **`/admin/san-pham`** (có form nhập từng ô riêng, không cần tự gõ JSON).

1. **Cột Y — Thông số kỹ thuật:** 1 object JSON với các khóa `steelType`, `bladeLength`, `handleLength`, `thickness`, `weight`, `handleMaterial`, `origin`, `warranty` — khóa nào không có cứ bỏ qua.
2. **Cột Z — Biến thể cán:** 1 mảng JSON, mỗi phần tử có `handleType` (`"can-sat"` hoặc `"can-go"`), `label`, `price`, `salePrice` (tuỳ chọn), `stock` (tuỳ chọn). **Để trống nếu sản phẩm chỉ có 1 phiên bản duy nhất** (ví dụ đá mài) — khi đó trang chi tiết sản phẩm sẽ không hiển thị khối chọn cán, chỉ dùng giá ở cột D/E.
3. **Cách web xử lý khi ô trống:** đọc thành `undefined`/mảng rỗng, trang chi tiết sản phẩm (`components/ProductDetailView.tsx`) tự ẩn khối "Loại cán" nếu không có biến thể nào.
4. **Giỏ hàng hỗ trợ đặt cùng lúc 2 biến thể của cùng 1 dao** (ví dụ Dao chặt gà cán sắt x1 + Dao chặt gà cán gỗ x2) — mỗi biến thể là 1 dòng riêng trong giỏ, giá tính đúng theo biến thể đã chọn.
5. Khuyến nghị: **luôn thêm/sửa sản phẩm qua trang Admin** thay vì gõ tay JSON trực tiếp trên Sheet, để tránh lỗi cú pháp JSON làm sản phẩm không hiển thị đúng.

---

## 4.1. Sheet "Banners" (banner trang chủ) — mới thêm

Tạo thêm 1 tab tên `Banners`, hàng 1 là tiêu đề:

```
ID | Tiêu đề | Mô tả phụ | Ảnh | Nút chính | Nút phụ | Banner chính
```

- Quản lý hoàn toàn qua `/admin/banner` — Thêm/Sửa/Xóa, upload ảnh qua Cloudinary, tick "Đặt làm banner chính" để banner đó hiển thị đầu tiên trên trang chủ (chỉ nên tick đúng 1 dòng).
- Nếu chưa tạo tab này hoặc chưa cấu hình Google Sheets, trang chủ tự dùng banner mẫu có sẵn trong `lib/data.ts`.

---

## 5. Trang quản trị: Dashboard, Sản phẩm, Đơn hàng, Khách hàng, Banner, Mã giảm giá

### 5.1. Đăng nhập

- Vào `/admin/login` (ví dụ: `http://localhost:3000/admin/login`).
- Nhập mật khẩu = giá trị bạn đặt ở `ADMIN_PASSWORD` trong `.env.local`.
- Đăng nhập xong sẽ vào thẳng trang Dashboard.

### 5.2. Dashboard

Trang `/admin` hiển thị:
- **Tổng sản phẩm, Tổng đơn hàng, Doanh thu (trừ đơn đã hủy), Sản phẩm bán chạy nhất.**
- **Tổng lượt xem** toàn bộ sản phẩm, **Top sản phẩm được xem nhiều nhất**, **Hoạt động xem gần đây** (đếm từ tab `ProductViews`, tự động ghi mỗi khi khách mở trang chi tiết sản phẩm — không cần thao tác gì).

### 5.3. Quản lý sản phẩm (`/admin/san-pham`)

Trang hiển thị bảng tất cả sản phẩm đọc trực tiếp từ Sheet "Products" (ảnh, tên, danh mục, giá, tồn kho, nhãn Sale/Best Seller/Mới).

**Thêm sản phẩm mới:**
1. Bấm **"Thêm sản phẩm"**.
2. Điền form: ID (duy nhất, không dấu — ví dụ `dao-chat-ga-2`), Tên, Slug (tự gợi ý theo Tên), Danh mục, Giá, Giá giảm (nếu có), Mô tả ngắn, Mô tả, tối đa 5 ảnh — **bấm nút "Tải ảnh" để upload trực tiếp từ máy lên Cloudinary**, Tồn kho, Đánh giá, **Thông số kỹ thuật** (8 ô: loại thép, chiều dài lưỡi/cán, độ dày, trọng lượng, chất liệu cán, xuất xứ, bảo hành), **Biến thể cán sắt/cán gỗ** (bấm "+ Thêm biến thể", mỗi biến thể có giá + giá giảm + tồn kho riêng — để trống nếu sản phẩm chỉ có 1 phiên bản như đá mài), và các checkbox Sale/Best Seller/Mới/Nổi bật/Hiển thị công khai.
3. Bấm **"Thêm sản phẩm"** → ghi thêm 1 dòng mới vào cuối Sheet "Products" → sản phẩm xuất hiện ngay trên web.

**Sửa / Xóa / Ẩn:** bấm biểu tượng bút chì để sửa (ID không sửa được), biểu tượng thùng rác để xóa hẳn khỏi Sheet (có xác nhận trước khi xóa). Muốn **ẩn tạm** sản phẩm mà không xóa dữ liệu, bỏ tick "Hiển thị công khai" khi sửa.

### 5.4. Quản lý đơn hàng (`/admin/don-hang`)

- Danh sách đơn hàng đọc trực tiếp từ tab "Orders", mới nhất hiển thị trước.
- Lọc theo trạng thái: **Chờ xác nhận / Đã gọi / Đang giao / Hoàn thành / Đã hủy**.
- Đổi trạng thái ngay trên danh sách (dropdown) — ghi thẳng vào Sheet, không cần vào Sheet sửa tay.
- Có ô "Ghi chú nội bộ" riêng cho từng đơn (ví dụ lý do hủy, giờ hẹn giao...).

### 5.5. Quản lý khách hàng (`/admin/khach-hang`)

- Không cần Sheet riêng — trang này **tự động gom nhóm** các đơn hàng theo số điện thoại, hiển thị: Tên, SĐT, Địa chỉ, Tổng chi tiêu (trừ đơn đã hủy), và bấm vào từng khách để xem toàn bộ lịch sử đơn hàng.
- Có ô tìm kiếm theo tên hoặc số điện thoại.

### 5.6. Quản lý banner (`/admin/banner`)

- Thêm/Sửa/Xóa banner trang chủ, upload ảnh qua Cloudinary.
- Tick **"Đặt làm banner chính"** để banner đó hiển thị đầu tiên trong slideshow trang chủ (chỉ nên tick đúng 1 banner tại 1 thời điểm — hệ thống tự bỏ tick banner khác khi bạn chọn banner mới).

### 5.7. Quản lý mã giảm giá (`/admin/ma-giam-gia`)

- **Thêm mã:** Mã code, Loại (Giảm % / Giảm số tiền cố định / Miễn phí ship), Giá trị, **Đơn tối thiểu** (đây là điều kiện quan trọng — nếu để `0` nghĩa là áp dụng được với mọi đơn hàng, không giới hạn), Mô tả hiển thị ở trang chủ, Ngày hết hạn (tuỳ chọn), và bật/tắt kích hoạt.
- **Sửa/Xóa:** tương tự trang sản phẩm.
- Tắt (bỏ tick "Đang kích hoạt") thay vì xóa nếu bạn muốn tạm ngưng 1 mã mà vẫn giữ lịch sử.

### 5.8. Upload ảnh qua Cloudinary

Điền đủ 3 biến `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` trong `.env.local` (lấy tại [console.cloudinary.com/settings/api-keys](https://console.cloudinary.com/settings/api-keys)). Sau đó, ở form Thêm/Sửa sản phẩm hoặc banner, bấm nút **"Tải ảnh"** cạnh mỗi ô ảnh để chọn file từ máy — ảnh sẽ tự động upload lên Cloudinary và điền URL vào ô tương ứng.

### 5.9. Đăng xuất

Bấm "Đăng xuất" ở sidebar (hoặc header trên mobile).

---

## 6. Vì sao web không cập nhật ngay lập tức đôi khi?

Để không gọi Google Sheets API liên tục (dễ bị giới hạn tốc độ — quota), `lib/catalog.ts` cache dữ liệu sản phẩm trong **30 giây** cho các trang công khai (trang chủ, danh mục, chi tiết sản phẩm). Nghĩa là sau khi bạn Thêm/Sửa/Xóa trong Admin:
- Trang **Admin** luôn thấy dữ liệu mới nhất ngay lập tức (không cache).
- Trang **web công khai** có thể mất tối đa 30 giây để thấy thay đổi, hoặc bạn chỉ cần tải lại trang sau vài giây.

Muốn thay đổi thời gian cache, sửa hằng số `CACHE_TTL_MS` trong `lib/catalog.ts`.

---

## 7. Lưu ý bảo mật

- **Đặt `ADMIN_PASSWORD` đủ mạnh** trước khi đưa web lên production — không dùng chung mật khẩu với tài khoản khác.
- Không commit file `.env.local` lên Git (đã có `.gitignore` mặc định của Next.js loại trừ file này).
- Cơ chế đăng nhập admin hiện tại là **mật khẩu đơn (single password), lưu trong cookie httpOnly** — phù hợp cho 1 người quản trị / giai đoạn phát triển. Nếu cần nhiều tài khoản admin với phân quyền, nên nâng cấp sang giải pháp như NextAuth.js hoặc Clerk — nói với mình khi bạn cần.
- `GOOGLE_PRIVATE_KEY` là bí mật quan trọng nhất — nếu lộ, người khác có thể đọc/ghi toàn bộ Sheet của bạn. Không dán vào code, chỉ để trong `.env.local` (local) hoặc biến môi trường của nền tảng hosting (Vercel/VPS...).

---

## 8. Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `Chưa cấu hình Google Sheets` | Thiếu 1 trong 3 biến `GOOGLE_SHEET_ID` / `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY` trong `.env.local` | Kiểm tra lại `.env.local`, khởi động lại `npm run dev` |
| `403 The caller does not have permission` | Chưa **Share** Sheet cho email Service Account, hoặc share nhầm quyền Viewer thay vì Editor | Mở Sheet → Share → dán lại `client_email` → chọn **Editor** |
| `Không tìm thấy sheet tên "Products"` | Tab trong Sheet không đặt đúng tên `Products` (phân biệt hoa/thường) | Đổi tên tab đúng chữ `Products` |
| Trang admin cứ đá về `/admin/login` dù đăng nhập đúng | Cookie bị chặn (trình duyệt chặn cookie, hoặc test qua HTTP không phải localhost) | Thử lại trên `localhost`, kiểm tra trình duyệt không chặn cookie |
| Sản phẩm thêm ở Admin không hiện trên web | Vẫn trong 30 giây cache, hoặc thiếu cột bắt buộc (ID/Tên/Danh mục) | Đợi vài giây / tải lại trang, kiểm tra dữ liệu ở Sheet |
| Ký tự `\n` bị lỗi trong Private Key | Copy thiếu `\n` hoặc thiếu dấu ngoặc kép khi dán vào `.env.local` | Đảm bảo để nguyên `\n` trong chuỗi, bọc trong `"..."` |
| `Chưa cấu hình Cloudinary` khi bấm "Tải ảnh" | Thiếu `CLOUDINARY_API_SECRET` trong `.env.local` | Lấy API Secret tại console.cloudinary.com/settings/api-keys rồi điền vào |
| Dashboard hiện "Chưa có dữ liệu lượt xem" dù đã xem sản phẩm | Chưa tạo tab `ProductViews` trong Sheet, hoặc sai tên tab | Tạo đúng tab tên `ProductViews` với 4 cột như mục 3.2 |
| Đơn dưới mức tối thiểu vẫn áp được mã (lỗi cũ) | Đã sửa — nếu vẫn gặp, kiểm tra cột "Đơn tối thiểu" trong Sheet Vouchers có đang để trống/0 không | Điền đúng số tiền tối thiểu vào cột D của tab Vouchers |

---

## 8.1. Đã sửa: trang thanh toán

- **Phương thức thanh toán đã ẩn khỏi giao diện** — đơn hàng vẫn gửi đi với giá trị mặc định `COD`. Muốn hiện lại: mở `app/thanh-toan/page.tsx`, đổi `const SHOW_PAYMENT_METHODS = false;` thành `true`.
- **Lỗi áp mã giảm giá dưới điều kiện tối thiểu đã được sửa.** Việc kiểm tra chuyển hẳn sang API `/api/vouchers/validate` — kiểm tra đúng đơn tối thiểu, mã còn hiệu lực, chưa hết hạn, và điều kiện kết hợp (độc quyền / loại trừ freeship) trước khi cho áp dụng.
- **Lỗi 404 ở trang thanh toán (đã sửa)**: nguyên nhân là file được tải rời về và lưu với tên `thanh-toan-page.tsx` thay vì đổi tên đúng thành `page.tsx` trong thư mục `app/thanh-toan/`. Next.js App Router **bắt buộc** tên file phải chính xác là `page.tsx` (hoặc `route.ts` cho API) thì mới nhận diện được route — nếu tự merge code thủ công từ các file tải rời, luôn kiểm tra lại đúng tên file trước khi lưu.

## 9. Danh sách file liên quan (để bạn dễ tra khi cần sửa)

- `lib/googleSheets.ts` — toàn bộ hàm đọc/ghi/xóa Google Sheets (Products + Orders + Banners + Vouchers + ProductViews + Reviews + Posts).
- `lib/catalog.ts`, `lib/vouchers.ts`, `lib/reviews.ts`, `lib/blog.ts` — lớp trung gian cho từng loại dữ liệu (Sheets thật ⇄ mock, có cache).
- `lib/schema.ts`, `lib/seo.ts` — Schema.org JSON-LD + cấu hình SEO/Google Business trung tâm.
- `lib/analytics.ts` — tổng hợp dữ liệu lượt xem cho Dashboard.
- `lib/cloudinary.ts` — upload ảnh (sản phẩm + banner + bài viết).
- `lib/cart-context.tsx` — giỏ hàng, hỗ trợ biến thể cán sắt/cán gỗ.
- `lib/admin-constants.ts`, `lib/admin-auth.ts`, `middleware.ts` — xác thực trang Admin.
- `components/admin/ProductForm.tsx`, `BannerForm.tsx`, `VoucherForm.tsx`, `PostForm.tsx` — form thêm/sửa.
- `components/ProductDetailView.tsx` — chọn biến thể cán sắt/cán gỗ + bảng thông số kỹ thuật.
- `components/seo/JsonLd.tsx`, `AnalyticsScripts.tsx` — nhúng Schema.org + GA4/GTM.
- `app/admin/layout.tsx` — sidebar điều hướng Admin.
- `app/admin/page.tsx`, `san-pham/`, `don-hang/`, `khach-hang/`, `banner/`, `ma-giam-gia/`, `danh-gia/`, `bai-viet/` — các trang Admin.
- `app/api/admin/**` — API CRUD & upload (yêu cầu đăng nhập Admin).
- `app/api/orders`, `app/api/track-view`, `app/api/vouchers/**`, `app/api/reviews` — API công khai.
- `app/sitemap.ts`, `app/robots.ts` — SEO tự sinh.
- `GOOGLE_SHEETS_SETUP.md` — hướng dẫn tạo Service Account chi tiết từng bước.

Có gì chưa rõ hoặc muốn phát triển thêm phần nào, cứ trao đổi tiếp.
