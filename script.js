/* ============================================================
   KATANA Premium Kitchen Knives — script.js
   ============================================================
   CẤU HÌNH:
   Thay YOUR_APPS_SCRIPT_URL bằng URL sau khi deploy Google Apps Script
   ============================================================ */

const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxbS1hvUZXKifxQzIMm1K3MYSg0elOqmTwLuAsBuFzWyo-5vudGObLG9AiFoyQJvRCoXw/exec',

  // Toạ độ mặc định khi chưa lấy vị trí (Hà Nội)
  DEFAULT_COORDS: [21.0278, 105.8342],
  DEFAULT_ZOOM: 13,
};

/* ============================
   A. LOADING SCREEN
============================ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1500);
});

/* ============================
   B. NAVBAR SCROLL EFFECT
============================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  toggleFloatButtons();
});

/* ============================
   C. SCROLL REVEAL ANIMATION
============================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ============================
   D. BACK TO TOP + STICKY CTA
============================ */
const backTop = document.getElementById('backTop');
const stickyCta = document.getElementById('stickyCta');

function toggleFloatButtons() {
  const show = window.scrollY > 400;
  backTop.classList.toggle('visible', show);
  stickyCta.classList.toggle('visible', show);
}

backTop.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);

/* ============================
   E. PRODUCT FILTER
============================ */
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    document.querySelectorAll('.product-item').forEach((item) => {
      const cat = item.dataset.cat;
      const show = filter === 'all' || cat.includes(filter);
      item.style.display = show ? '' : 'none';
      if (show) item.style.animation = 'fadeUp 0.5s forwards';
    });
  });
});

/* ============================
   F. PRODUCT SELECTOR IN FORM
============================ */
document.querySelectorAll('.product-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.product-option').forEach((o) =>
      o.classList.remove('selected')
    );
    opt.classList.add('selected');
    document.getElementById('selectedProduct').value = opt.dataset.product;
  });
});

/**
 * Cuộn xuống form đặt hàng và chọn sẵn sản phẩm
 * @param {string} productName - Tên sản phẩm cần chọn
 */
function scrollToOrder(productName) {
  document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    document.querySelectorAll('.product-option').forEach((o) => {
      o.classList.toggle('selected', o.dataset.product === productName);
    });
    document.getElementById('selectedProduct').value = productName;
  }, 600);
}

/* ============================
   G. LEAFLET MAP
============================ */
let map, marker;
let selectedLat = null;
let selectedLng = null;

// Marker icon tùy chỉnh màu đỏ rượu
const customIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;
    background:#6b1a1a;
    border:2px solid #a02828;
    border-radius:50%;
    box-shadow:0 0 10px rgba(107,26,26,0.7)
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
});

function initMap() {
  map = L.map('map').setView(CONFIG.DEFAULT_COORDS, CONFIG.DEFAULT_ZOOM);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Click trên bản đồ để chọn vị trí
  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    setMarker(lat, lng, 'Đã chọn');
  });
}

/**
 * Đặt marker trên bản đồ và lưu toạ độ
 */
function setMarker(lat, lng, label) {
  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
  selectedLat = lat;
  selectedLng = lng;
  document.getElementById('coordInfo').innerHTML =
    `<i class="bi bi-geo-alt-fill" style="color:var(--wine-glow)"></i> 
     ${label}: <strong>${lat.toFixed(5)}, ${lng.toFixed(5)}</strong>`;
}

/**
 * Lấy vị trí hiện tại của thiết bị
 */
document.getElementById('btnLocate').addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Trình duyệt không hỗ trợ định vị GPS.');
  }

  const btn = document.getElementById('btnLocate');
  btn.innerHTML = '<i class="bi bi-arrow-repeat me-2" style="animation:spin 0.8s linear infinite;display:inline-block"></i>Đang lấy vị trí...';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      map.setView([latitude, longitude], 16);
      setMarker(latitude, longitude, 'Vị trí hiện tại');
      btn.innerHTML = '<i class="bi bi-geo-alt me-2"></i>Lấy vị trí hiện tại';
      btn.disabled = false;
    },
    () => {
      alert('Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập GPS.');
      btn.innerHTML = '<i class="bi bi-geo-alt me-2"></i>Lấy vị trí hiện tại';
      btn.disabled = false;
    },
    { timeout: 10000, maximumAge: 60000 }
  );
});

// Khởi tạo bản đồ
initMap();

/* ============================
   H. FORM VALIDATION
============================ */

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ (10 chữ số, bắt đầu bằng 0)
 * Hỗ trợ đầu số: 03x, 05x, 07x, 08x, 09x
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\.]/g, '');
  return /^(0[35789]\d{8})$/.test(cleaned);
}

/**
 * Hiện lỗi cho một field
 */
function showError(el, show) {
  if (show) {
    el.classList.add('is-invalid');
    el.classList.remove('is-valid');
  } else {
    el.classList.remove('is-invalid');
    el.classList.add('is-valid');
  }
}

// Xoá lỗi khi người dùng gõ lại
['fullName', 'phone', 'address'].forEach((id) => {
  document.getElementById(id).addEventListener('input', function () {
    this.classList.remove('is-invalid', 'is-valid');
  });
});

/* ============================
   I. GOOGLE SHEETS — GỬI DỮ LIỆU
============================ */

/**
 * Gửi dữ liệu đơn hàng lên Google Apps Script → Google Sheets
 *
 * Chiến lược:
 *   1. Thử POST no-cors (body JSON)  — Apps Script nhận qua e.postData
 *   2. Nếu POST throw (network error) thử GET với query-string fallback
 *
 * no-cors trả về opaque response nên không đọc được status,
 * ta coi là thành công khi fetch() không throw exception.
 *
 * @param {Object} data - Dữ liệu đơn hàng
 * @returns {Promise<{success: boolean, method: string}>}
 */
async function submitToGoogleSheets(data) {
  const url = CONFIG.APPS_SCRIPT_URL;

  // ── Phương thức 1: POST no-cors (ưu tiên) ──────────────────────────────
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',          // bắt buộc với Apps Script
      headers: { 'Content-Type': 'text/plain' }, // text/plain vượt preflight
      body: JSON.stringify(data),
    });
    console.log('✅ Đã gửi đơn hàng qua POST no-cors');
    return { success: true, method: 'POST' };

  } catch (postErr) {
    console.warn('⚠️  POST thất bại, thử GET fallback…', postErr);
  }

  // ── Phương thức 2: GET fallback (query-string) ──────────────────────────
  try {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) => params.append(k, v));

    // no-cors với GET — Apps Script nhận qua e.parameter
    await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      mode: 'no-cors',
    });
    console.log('✅ Đã gửi đơn hàng qua GET fallback');
    return { success: true, method: 'GET' };

  } catch (getErr) {
    console.error('❌ Cả POST lẫn GET đều thất bại:', getErr);
    // Ném lỗi để caller xử lý — nhưng vẫn hiện modal thành công
    // vì lỗi thường do network / CORS opaque, dữ liệu có thể đã ghi được
    throw getErr;
  }
}

/* ============================
   J. TOAST HELPER
============================ */

/**
 * Hiện toast thông báo nhỏ ở góc màn hình
 * @param {string} msg   - Nội dung
 * @param {'success'|'error'|'info'} type
 */
function showToast(msg, type = 'info') {
  // Tạo container nếu chưa có
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText =
      'position:fixed;bottom:140px;right:24px;z-index:9000;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }

  const colors = {
    success: '#2e7d32',
    error:   '#b71c1c',
    info:    '#1a1a1f',
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    background:${colors[type]};
    border:1px solid rgba(255,255,255,0.12);
    color:#f5f5f7;
    padding:10px 18px;
    font-family:'Rajdhani',sans-serif;
    font-size:0.82rem;
    letter-spacing:0.05em;
    max-width:280px;
    opacity:0;
    transform:translateX(20px);
    transition:all 0.3s ease;
  `;
  toast.textContent = msg;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
  });

  // Animate out after 3.5s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* ============================
   K. FORM SUBMIT
============================ */
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // ── Validate ───────────────────────────────────────────────────────────
  let valid = true;

  const nameEl   = document.getElementById('fullName');
  const phoneEl  = document.getElementById('phone');
  const addrEl   = document.getElementById('address');
  const emailEl  = document.getElementById('email');

  const nameVal  = nameEl.value.trim();
  const phoneVal = phoneEl.value.trim();
  const addrVal  = addrEl.value.trim();
  const emailVal = emailEl.value.trim();

  if (!nameVal)               { showError(nameEl,  true);  valid = false; }
  else                        { showError(nameEl,  false); }

  if (!isValidPhone(phoneVal)) { showError(phoneEl, true);  valid = false; }
  else                         { showError(phoneEl, false); }

  if (!addrVal)               { showError(addrEl,  true);  valid = false; }
  else                        { showError(addrEl,  false); }

  if (!valid) {
    document.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Vui lòng kiểm tra lại thông tin.', 'error');
    return;
  }

  // ── Chuẩn bị dữ liệu ──────────────────────────────────────────────────
  const product = document.getElementById('selectedProduct').value || 'Chưa chọn';
  const note    = document.getElementById('note').value.trim();

  const orderData = {
    timestamp:  new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    fullName:   nameVal,
    phone:      phoneVal.replace(/[\s\-\.]/g, ''),
    address:    addrVal,
    email:      emailVal,
    product:    product,
    note:       note,
    latitude:   selectedLat !== null ? selectedLat.toFixed(6) : '',
    longitude:  selectedLng !== null ? selectedLng.toFixed(6) : '',
  };

  // ── Loading state ──────────────────────────────────────────────────────
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  showToast('Đang gửi đơn hàng…', 'info');

  // ── Gửi lên Google Sheets ─────────────────────────────────────────────
  let sheetOk = false;
  try {
    const result = await submitToGoogleSheets(orderData);
    sheetOk = result.success;
    if (sheetOk) {
      showToast('✓ Đã lưu vào Google Sheets', 'success');
    }
  } catch (err) {
    // Lỗi mạng hoặc CORS — vẫn hiện modal vì dữ liệu thường đã được ghi
    console.error('submitToGoogleSheets error:', err);
    showToast('Lưu Sheets có sự cố — vui lòng liên hệ hotline nếu cần.', 'error');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }

  // ── Hiện modal thành công (luôn luôn, dù Sheets lỗi) ─────────────────
  document.getElementById('orderSummary').innerHTML = `
    <div style="display:grid;gap:7px;line-height:1.5">
      <div>
        <span style="color:var(--silver-2)">Sản phẩm:</span>
        <span style="color:var(--white);margin-left:6px">${product}</span>
      </div>
      <div>
        <span style="color:var(--silver-2)">Khách hàng:</span>
        <span style="color:var(--white);margin-left:6px">${nameVal}</span>
      </div>
      <div>
        <span style="color:var(--silver-2)">Điện thoại:</span>
        <span style="color:var(--white);margin-left:6px">${orderData.phone}</span>
      </div>
      <div>
        <span style="color:var(--silver-2)">Địa chỉ:</span>
        <span style="color:var(--white);margin-left:6px">${addrVal}</span>
      </div>
      ${emailVal ? `<div><span style="color:var(--silver-2)">Email:</span><span style="color:var(--white);margin-left:6px">${emailVal}</span></div>` : ''}
      ${selectedLat ? `<div><span style="color:var(--silver-2)">GPS:</span><span style="color:var(--white);margin-left:6px">${orderData.latitude}, ${orderData.longitude}</span></div>` : ''}
      <div>
        <span style="color:var(--silver-2)">Thời gian:</span>
        <span style="color:var(--white);margin-left:6px">${orderData.timestamp}</span>
      </div>
      <div style="margin-top:4px;font-size:0.72rem;color:${sheetOk ? '#4caf50' : 'var(--silver-2)'}">
        ${sheetOk ? '● Đã lưu vào Google Sheets' : '● Sẽ được xác nhận qua điện thoại'}
      </div>
    </div>`;

  new bootstrap.Modal(document.getElementById('successModal')).show();

  // Reset form sau khi modal đã hiện
  resetForm();
});

/**
 * Reset toàn bộ form về trạng thái ban đầu
 */
function resetForm() {
  document.getElementById('orderForm').reset();

  // Xoá valid/invalid classes
  document.querySelectorAll('.is-valid, .is-invalid').forEach((el) => {
    el.classList.remove('is-valid', 'is-invalid');
  });

  // Bỏ chọn sản phẩm
  document.querySelectorAll('.product-option').forEach((o) => o.classList.remove('selected'));
  document.getElementById('selectedProduct').value = '';

  // Reset bản đồ
  document.getElementById('coordInfo').textContent = '';
  if (marker) { map.removeLayer(marker); marker = null; }
  selectedLat = null;
  selectedLng = null;
  map.setView(CONFIG.DEFAULT_COORDS, CONFIG.DEFAULT_ZOOM);
}
