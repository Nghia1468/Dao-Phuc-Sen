// ============================================================
// KATANA — Google Apps Script
// Dán toàn bộ code này vào: script.google.com → New Project
//
// CÁCH SỬ DỤNG:
//   1. Mở: https://script.google.com
//   2. Tạo project mới, dán code này vào
//   3. Thay SPREADSHEET_ID bằng ID của Google Sheet của bạn
//   4. Deploy → New deployment → Web App
//      Execute as: Me | Who has access: Anyone
//   5. Copy URL deploy → dán vào script.js (CONFIG.APPS_SCRIPT_URL)
// ============================================================

// ⚠️  THAY ID GOOGLE SHEET CỦA BẠN VÀO ĐÂY
// Lấy từ URL: https://docs.google.com/spreadsheets/d/<<ID_NẰM_Ở_ĐÂY>>/edit
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

// Tiêu đề cột — thứ tự phải khớp với mảng rowData bên dưới
const HEADERS = [
  'Timestamp',
  'Họ và tên',
  'Số điện thoại',
  'Địa chỉ',
  'Email',
  'Sản phẩm',
  'Ghi chú',
  'Latitude',
  'Longitude',
];

// ============================================================
// doPost — nhận dữ liệu từ fetch POST (body JSON)
// ============================================================
function doPost(e) {
  try {
    // Parse JSON từ body
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    const result = saveOrder(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', sheet: result.sheetName, row: result.row }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// doGet — nhận dữ liệu từ query-string (fallback GET)
// ============================================================
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};

    // Nếu không có tham số gì → trả về trang kiểm tra sức khỏe
    if (!params.fullName && !params.phone) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', message: 'KATANA API is running ✓' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const result = saveOrder(params);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', sheet: result.sheetName, row: result.row }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doGet error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// saveOrder — lưu 1 đơn hàng vào sheet tháng hiện tại
// ============================================================
function saveOrder(data) {
  const ss        = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = getMonthSheetName();          // VD: "2026-05"
  const sheet     = getOrCreateSheet(ss, sheetName);

  // Dữ liệu 1 hàng — thứ tự khớp HEADERS
  const rowData = [
    data.timestamp  || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    data.fullName   || '',
    data.phone      || '',
    data.address    || '',
    data.email      || '',
    data.product    || '',
    data.note       || '',
    data.latitude   || '',
    data.longitude  || '',
  ];

  sheet.appendRow(rowData);

  // Log để debug (xem trong Apps Script → Executions)
  Logger.log('Saved order → sheet: ' + sheetName + ' | name: ' + (data.fullName || '?'));

  return { sheetName, row: sheet.getLastRow() };
}

// ============================================================
// getMonthSheetName — tạo tên sheet theo tháng: "2026-05"
// ============================================================
function getMonthSheetName() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 01–12
  return year + '-' + month;
}

// ============================================================
// getOrCreateSheet — lấy sheet theo tên, tạo mới nếu chưa có
// ============================================================
function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    // Tạo sheet mới ở cuối
    sheet = ss.insertSheet(name);

    // Thêm hàng tiêu đề với định dạng đẹp
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS]);
    headerRange.setBackground('#1a1a1f');
    headerRange.setFontColor('#e8e8f0');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);

    // Đóng băng hàng tiêu đề
    sheet.setFrozenRows(1);

    // Tự động resize cột
    sheet.autoResizeColumns(1, HEADERS.length);

    Logger.log('Created new sheet: ' + name);
  }

  return sheet;
}

// ============================================================
// testSave — chạy thủ công để kiểm tra (F5 trong editor)
// ============================================================
function testSave() {
  const fakeData = {
    timestamp:  '29/05/2026, 10:30:00',
    fullName:   'Nguyễn Test',
    phone:      '0901234567',
    address:    '123 Lê Lợi, Quận 1, TP.HCM',
    email:      'test@example.com',
    product:    'Dao Chef Gyuto',
    note:       'Test tự động',
    latitude:   '10.77609',
    longitude:  '106.70082',
  };

  const result = saveOrder(fakeData);
  Logger.log('testSave result: ' + JSON.stringify(result));
}
