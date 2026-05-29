# 📖 Hướng dẫn cài đặt — KATANA Website

> Đọc từ trên xuống theo thứ tự. Làm xong bước 1 mới làm bước 2.

---

## Cấu trúc project

```
katana-website/
├── index.html              ← Trang web chính
├── style.css               ← Toàn bộ CSS
├── script.js               ← JavaScript + Google Sheets API
├── google-apps-script.js   ← Code dán vào Google Apps Script
└── HUONG_DAN.md            ← File này
```

---

## BƯỚC 1 — Tạo Google Sheets

### 1.1 Tạo Spreadsheet mới

1. Mở [https://sheets.google.com](https://sheets.google.com)
2. Nhấn **+ Blank** để tạo sheet mới
3. Đặt tên: `KATANA — Đơn hàng`
4. Sao chép **ID** từ URL trình duyệt:

```
https://docs.google.com/spreadsheets/d/  <<< ID NẰM Ở ĐÂY >>>  /edit
```

> Ví dụ: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`

---

## BƯỚC 2 — Cài đặt Google Apps Script

### 2.1 Mở Apps Script

1. Vào [https://script.google.com](https://script.google.com)
2. Nhấn **New project**
3. Đổi tên project: `KATANA API`

### 2.2 Dán code

1. Xoá code mẫu có sẵn (`function myFunction() {}`)
2. Mở file `google-apps-script.js` trong project này
3. **Copy toàn bộ** và dán vào Apps Script editor

### 2.3 Cấu hình Spreadsheet ID

Tìm dòng này trong code:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
```

Thay `YOUR_SPREADSHEET_ID` bằng ID đã copy ở Bước 1.4:

```javascript
const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';
```

### 2.4 Kiểm tra trước khi deploy

1. Chọn function `testSave` trong dropdown
2. Nhấn **▶ Run**
3. Vào Google Sheets → kiểm tra có sheet `2026-05` (tháng hiện tại) và 1 dòng dữ liệu test không

### 2.5 Deploy Web App

1. Nhấn **Deploy → New deployment**
2. Nhấn biểu tượng ⚙️ → chọn **Web app**
3. Điền:
   - Description: `KATANA v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Nhấn **Deploy**
5. **Copy URL** có dạng:

```
https://script.google.com/macros/s/AKfycb.../exec
```

> ⚠️ URL này đã được cấu hình sẵn trong `script.js`. Nếu bạn tạo script mới với ID khác, thay URL trong `script.js` → `CONFIG.APPS_SCRIPT_URL`.

---

## BƯỚC 3 — Kiểm tra kết nối

### 3.1 Mở website và đặt thử

1. Mở `index.html` bằng trình duyệt (hoặc dùng Live Server)
2. Điền form đặt hàng đầy đủ
3. Nhấn **Xác nhận đặt hàng**
4. Vào Google Sheets → kiểm tra dòng mới vừa được thêm

### 3.2 Kiểm tra Apps Script logs

Nếu có lỗi: **Apps Script editor → Executions** → xem log chi tiết.

---

## BƯỚC 4 — Deploy lên GitHub Pages

### 4.1 Tạo GitHub repository

1. Vào [https://github.com](https://github.com) → Đăng nhập
2. Nhấn **New repository**
3. Điền:
   - Repository name: `katana-knives` (hoặc tên bất kỳ)
   - Visibility: **Public**
   - ✅ Add a README file
4. Nhấn **Create repository**

### 4.2 Upload file

**Cách A — Qua giao diện web (đơn giản):**

1. Vào repository vừa tạo
2. Nhấn **Add file → Upload files**
3. Kéo thả 3 file: `index.html`, `style.css`, `script.js`
4. Nhấn **Commit changes**

**Cách B — Dùng Git (khuyến nghị):**

```bash
# Clone repo về máy
git clone https://github.com/<username>/katana-knives.git
cd katana-knives

# Copy 3 file vào thư mục này
cp /path/to/katana-website/index.html .
cp /path/to/katana-website/style.css .
cp /path/to/katana-website/script.js .

# Push lên GitHub
git add .
git commit -m "feat: add KATANA website"
git push origin main
```

### 4.3 Bật GitHub Pages

1. Vào repository → tab **Settings**
2. Tìm mục **Pages** (trong sidebar trái)
3. Trong **Source**: chọn **Deploy from a branch**
4. Branch: **main** | Folder: **/ (root)**
5. Nhấn **Save**
6. Chờ 1–2 phút → link website xuất hiện:

```
https://<username>.github.io/katana-knives/
```

---

## BƯỚC 5 — Cấu hình cuối cùng (quan trọng)

Sau khi có link GitHub Pages, kiểm tra form vẫn gửi được lên Sheets:

1. Mở `https://<username>.github.io/katana-knives/`
2. Đặt thử 1 đơn hàng
3. Kiểm tra Google Sheets có dữ liệu mới không

> Nếu không thấy: Vào **Apps Script → Deploy → Manage deployments** → nhấn ✏️ Edit → chọn **New version** → Deploy lại.

---

## Cập nhật website sau này

```bash
# Chỉnh sửa file xong, chạy lệnh này
git add .
git commit -m "fix: update content"
git push origin main
```

GitHub Pages tự động rebuild trong ~1 phút.

---

## Xử lý sự cố thường gặp

| Vấn đề | Nguyên nhân | Cách xử lý |
|--------|-------------|------------|
| Form submit nhưng không thấy data trên Sheets | `SPREADSHEET_ID` sai | Kiểm tra lại ID trong Apps Script |
| Lỗi "Script function not found" | Chưa deploy hoặc deploy cũ | Deploy → New deployment |
| Bản đồ không hiện | Chặn Leaflet CDN | Tải Leaflet về local hoặc dùng CDN khác |
| GitHub Pages trắng | `index.html` không ở root | Kiểm tra cấu trúc thư mục |
| CORS error trên console | Bình thường với no-cors | Bỏ qua — dữ liệu vẫn ghi được |

---

## Liên hệ hỗ trợ

- Email: info@katanaknives.vn
- Hotline: 1800 6868
