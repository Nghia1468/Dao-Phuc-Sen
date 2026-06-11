// ============================================================
// LANG DAO PHUC SEN — Google Apps Script  v3
// Deploy: script.google.com → New project → paste this code
// Execute as: Me | Access: Anyone
// ============================================================
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // ← thay ID sheet của bạn

const HEADERS = [
  'Thời gian','Họ tên','Điện thoại',
  'Tỉnh/Thành','Xã/Phường','Địa chỉ chi tiết',
  'Thời gian giao','Email','Ghi chú',
  'Sản phẩm (chi tiết)',
  'Tạm tính','Phí ship','Tổng tiền',
  'Latitude','Longitude'
];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const r = save(d);
    return out({ ok: true, sheet: r.sheet, row: r.row });
  } catch(err) {
    Logger.log('doPost: ' + err);
    return out({ ok: false, msg: err.toString() });
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!p.fullName && !p.phone) return out({ ok: true, msg: 'API running v3' });
  try {
    const r = save(p);
    return out({ ok: true, sheet: r.sheet, row: r.row });
  } catch(err) {
    return out({ ok: false, msg: err.toString() });
  }
}

function save(d) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const name  = monthSheet();
  const sheet = getOrCreate(ss, name);
  sheet.appendRow([
    d.timestamp    || new Date().toLocaleString('vi-VN'),
    d.fullName     || '',
    d.phone        || '',
    d.province     || '',
    d.ward         || '',
    d.address      || '',
    d.deliveryTime || '',
    d.email        || '',
    d.note         || '',
    d.products     || '',        // "Dao Chặt Gà (Cán Gỗ) x2 = 390.000đ | ..."
    Number(d.subtotal)  || 0,
    Number(d.shipFee)   || 0,
    Number(d.total)     || 0,
    d.latitude  || '',
    d.longitude || '',
  ]);
  Logger.log('Saved → ' + name + ' row ' + sheet.getLastRow());
  return { sheet: name, row: sheet.getLastRow() };
}

function monthSheet() {
  const n = new Date();
  return n.getFullYear() + '-' + String(n.getMonth()+1).padStart(2,'0');
}

function getOrCreate(ss, name) {
  let s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    const r = s.getRange(1, 1, 1, HEADERS.length);
    r.setValues([HEADERS]);
    r.setBackground('#1a1a1f');
    r.setFontColor('#e8e8f0');
    r.setFontWeight('bold');
    s.setFrozenRows(1);
    s.autoResizeColumns(1, HEADERS.length);
    Logger.log('Created sheet: ' + name);
  }
  return s;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Test: chọn hàm này → Run */
function testSave() {
  const r = save({
    timestamp:'04/06/2026, 10:00:00', fullName:'Test User', phone:'0934596198',
    province:'Cao Bằng', ward:'Phúc Sen', address:'123 Làng Nghề',
    deliveryTime:'Buổi sáng', email:'test@test.com', note:'Test đơn v3',
    products:'Dao Chặt Gà (Cán Gỗ) x2 = 390.000đ | Dao Thái Thịt (Cán Sắt) x1 = 130.000đ',
    subtotal:520000, shipFee:0, total:520000
  });
  Logger.log(JSON.stringify(r));
}
