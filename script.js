/* ============================================================
   LANG DAO PHUC SEN — script.js  v3
   ============================================================ */

const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwcP1fPONM_x1I2GvWo3UrCWDKh5bX4qIPUgt9Yb4Ll7sGGGYGnB5kJ0sHUoBAMBxYx/exec',
  VN_ADDRESS_API:  'https://provinces.open-api.vn/api',
  DEFAULT_COORDS:  [22.665, 106.254],
  DEFAULT_ZOOM:    13,
};

/* ════════════════════════════════════════════════
   A. UTILITIES
════════════════════════════════════════════════ */
const fmt = n => n.toLocaleString('vi-VN') + 'đ';

function toast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast-item toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 3800);
}

/* ════════════════════════════════════════════════
   B. LOADER
════════════════════════════════════════════════ */
window.addEventListener('load', () =>
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1600)
);

/* ════════════════════════════════════════════════
   C. NAVBAR
════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  toggleFloat();
});

/* ════════════════════════════════════════════════
   D. SCROLL REVEAL
════════════════════════════════════════════════ */
const ro = new IntersectionObserver(entries =>
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } }),
  { threshold: 0.1 }
);
const observeReveal = () => document.querySelectorAll('.reveal:not(.visible)').forEach(el => ro.observe(el));
observeReveal();

/* ════════════════════════════════════════════════
   E. HERO SLIDESHOW
════════════════════════════════════════════════ */
let heroIdx = 0, heroTimer;

function buildHero() {
  const track  = document.getElementById('heroTrack');
  const dots   = document.getElementById('heroDots');
  const title  = document.getElementById('heroTitle');
  const sub    = document.getElementById('heroSubtitle');

  /* Preload + build slides */
  HERO_SLIDES.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'hero-slide' + (i === 0 ? ' active' : '');
    div.innerHTML = `<div class="hero-slide-bg" style="background-image:url('${s.img}')"></div><div class="hero-overlay"></div>`;
    track.appendChild(div);

    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => goSlide(i));
    dots.appendChild(dot);

    /* Preload image */
    new Image().src = s.img;
  });

  /* Set first content */
  title.innerHTML = HERO_SLIDES[0].title;
  sub.textContent = HERO_SLIDES[0].subtitle;
  startHeroTimer();
}

function goSlide(idx) {
  const slides = document.querySelectorAll('.hero-slide');
  const dotEls = document.querySelectorAll('.hero-dot');
  const title  = document.getElementById('heroTitle');
  const sub    = document.getElementById('heroSubtitle');

  slides[heroIdx].classList.remove('active');
  dotEls[heroIdx].classList.remove('active');

  heroIdx = (idx + HERO_SLIDES.length) % HERO_SLIDES.length;

  slides[heroIdx].classList.add('active');
  dotEls[heroIdx].classList.add('active');

  title.style.opacity = '0';
  sub.style.opacity   = '0';
  setTimeout(() => {
    title.innerHTML = HERO_SLIDES[heroIdx].title;
    sub.textContent = HERO_SLIDES[heroIdx].subtitle;
    title.style.opacity = '1';
    sub.style.opacity   = '1';
  }, 400);

  clearInterval(heroTimer);
  startHeroTimer();
}

function startHeroTimer() {
  heroTimer = setInterval(() => goSlide(heroIdx + 1), 5000);
}

buildHero();

/* ════════════════════════════════════════════════
   F. FLOAT BUTTONS
════════════════════════════════════════════════ */
function toggleFloat() {
  const show = window.scrollY > 300;
  document.querySelectorAll('.float-btn, #backTop').forEach(el => el.classList.toggle('visible', show));
}
document.getElementById('backTop')?.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);

/* ════════════════════════════════════════════════
   G. RENDER PRODUCT CARDS
════════════════════════════════════════════════ */
function buildCatTabs() {
  const bar = document.getElementById('catTabs');
  bar.innerHTML = '';

  const allTab = document.createElement('button');
  allTab.className = 'cat-tab active';
  allTab.dataset.cat = 'all';
  allTab.textContent = 'Tất cả';
  bar.appendChild(allTab);

  CATEGORY_ORDER.forEach(key => {
    const t = document.createElement('button');
    t.className = 'cat-tab';
    t.dataset.cat = key;
    t.innerHTML = `<i class="bi ${PRODUCTS[key].icon} me-1"></i>${PRODUCTS[key].label}`;
    bar.appendChild(t);
  });

  bar.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      bar.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProducts(tab.dataset.cat);
    });
  });
}

function renderProducts(catKey) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';

  const cats = catKey === 'all'
    ? CATEGORY_ORDER.map(k => ({ key: k, ...PRODUCTS[k] }))
    : [{ key: catKey, ...PRODUCTS[catKey] }];

  cats.forEach(cat => {
    cat.items.forEach(item => {
      const minPrice = Math.min(...Object.values(item.variants).map(v => v.price));
      const col = document.createElement('div');
      /* col-6 = 2/row mobile, col-md-4 = 3/row tablet, col-lg-3 = 4/row desktop */
      col.className = 'col-6 col-md-4 col-lg-3';
      // Tạo chuỗi sao hiển thị (ví dụ 4.9 → 4 sao đầy + 1 nửa sao)
const rating      = item.rating      || 5.0;
const reviewCount = item.reviewCount || 0;
const soldCount   = item.soldCount   || 0;

// Render sao: mỗi sao đầy = bi-star-fill, nửa sao = bi-star-half, rỗng = bi-star
function renderStars(r) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (r >= i)        html += '<i class="bi bi-star-fill"></i>';
    else if (r >= i - 0.5) html += '<i class="bi bi-star-half"></i>';
    else               html += '<i class="bi bi-star"></i>';
  }
  return html;
}

col.innerHTML = `
  <div class="product-card reveal h-100">
    <div class="product-img-wrap">
      <img src="${item.img}" alt="${item.name}" loading="lazy"/>
      ${item.badge ? `<span class="product-badge">${item.badge}</span>` : ''}
      <span class="product-cat-tag">${cat.label}</span>
    </div>
    <div class="product-body">
      <h3 class="product-name">${item.name}</h3>

      <!-- ĐÁNH GIÁ SAO -->
      <div class="product-rating">
        <span class="product-stars">${renderStars(rating)}</span>
        <span class="product-rating-num">${rating.toFixed(1)}</span>
        <span class="product-review-count">(${reviewCount} đánh giá)</span>
      </div>

      <p class="product-desc">${item.desc}</p>
      <div class="product-footer">
        <div class="product-price"><small>từ</small>${fmt(minPrice)}</div>
        <button class="btn-buy" data-id="${item.id}" data-cat="${cat.key}">Mua ngay</button>
      </div>

      <!-- SỐ LƯỢNG ĐÃ BÁN -->
      <div class="product-sold">
        <i class="bi bi-bag-check-fill"></i>
        Đã bán <strong>${soldCount.toLocaleString('vi-VN')}</strong> cái
      </div>

    </div>
  </div>`;
      grid.appendChild(col);
    });
  });

  observeReveal();

  grid.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => openOrderModal(btn.dataset.id, btn.dataset.cat));
  });
}

buildCatTabs();
renderProducts('all');

/* ════════════════════════════════════════════════
   H. ORDER STATE — multi-product, multi-variant cart
════════════════════════════════════════════════ */
/*
  cart = Map<productId, Map<variantKey, qty>>
  Ví dụ: { "dc-ga" => { "can-sat" => 2, "can-go" => 3 } }
  Mỗi sản phẩm có thể chọn nhiều loại cán với số lượng riêng.
*/
const cart = new Map();
let deliveryTime = null;
let orderMap, orderMarker;
let selectedLat = null, selectedLng = null;

/* Tổng tiền tạm tính toàn giỏ */
function cartSubtotal() {
  let s = 0;
  cart.forEach((varMap, id) => {
    const p = getProductById(id);
    if (!p) return;
    varMap.forEach((qty, vKey) => {
      s += (p.variants[vKey]?.price || 0) * qty;
    });
  });
  return s;
}

function shipFee() {
  const sub = cartSubtotal();
  return sub >= SHIP_CONFIG.freeThreshold ? 0 : (sub === 0 ? 0 : SHIP_CONFIG.shipFee);
}

/* Tổng số lượng tất cả variant trong giỏ */
function cartTotalQty() {
  let n = 0;
  cart.forEach(varMap => varMap.forEach(qty => { n += qty; }));
  return n;
}

function getProductById(id) {
  for (const key of CATEGORY_ORDER) {
    const found = PRODUCTS[key].items.find(i => i.id === id);
    if (found) return found;
  }
  return null;
}

function getCatKeyById(id) {
  for (const key of CATEGORY_ORDER) {
    if (PRODUCTS[key].items.find(i => i.id === id)) return key;
  }
  return null;
}

/* ════════════════════════════════════════════════
   I. RENDER ORDER MODAL CONTENT
════════════════════════════════════════════════ */

/*
  renderPicker — danh sách checkbox theo từng sản phẩm.
  Khi sản phẩm được check, inline config (chọn loại cán + số lượng)
  xuất hiện ngay bên dưới dòng đó.
*/
function renderPicker() {
  const wrap = document.getElementById('pickerWrap');
  wrap.innerHTML = '';

  CATEGORY_ORDER.forEach(catKey => {
    const cat = PRODUCTS[catKey];

    /* Tiêu đề danh mục */
    const sec = document.createElement('div');
    sec.className = 'picker-section-title';
    sec.innerHTML = `<i class="bi ${cat.icon} me-1"></i>${cat.label}`;
    wrap.appendChild(sec);

    /* Mỗi sản phẩm là 1 hàng */
    cat.items.forEach(item => {
      const isSelected = cart.has(item.id);

      /* Row wrapper chứa checkbox + inline config */
      const row = document.createElement('div');
      row.className = 'picker-row' + (isSelected ? ' selected' : '');
      row.dataset.id = item.id;

      /* Phần checkbox + tên sản phẩm */
      const top = document.createElement('div');
      top.className = 'picker-row-top';
      top.innerHTML = `
        <span class="picker-cb-box${isSelected ? ' checked' : ''}">
          <i class="bi bi-check"></i>
        </span>
        <span class="picker-row-name">${item.name}</span>
        <span class="picker-row-price">từ ${fmt(Math.min(...Object.values(item.variants).map(v => v.price)))}</span>`;

      top.addEventListener('click', () => toggleCartItem(item.id, catKey));
      row.appendChild(top);

      /* Phần inline config (chỉ hiện khi sản phẩm được chọn) */
      if (isSelected) {
        const cfg = buildInlineConfig(item);
        row.appendChild(cfg);
      }

      wrap.appendChild(row);
    });
  });
}

/*
  buildInlineConfig — tạo phần chọn loại cán + số lượng ngay dưới sản phẩm.
  Mỗi variant (Cán Sắt / Cán Gỗ) có checkbox riêng + ô nhập số lượng.
*/
function buildInlineConfig(product) {
  const varMap = cart.get(product.id) || new Map();
  const wrap = document.createElement('div');
  wrap.className = 'picker-inline-cfg';

  Object.entries(product.variants).forEach(([vKey, variant]) => {
    const qty     = varMap.get(vKey) || 0;
    const checked = qty > 0;

    const line = document.createElement('div');
    line.className = 'vcfg-line';

    /* Checkbox chọn loại cán */
    const cbBox = document.createElement('span');
    cbBox.className = 'vcfg-cb' + (checked ? ' checked' : '');
    cbBox.innerHTML = '<i class="bi bi-check"></i>';

    /* Nhãn loại cán */
    const lbl = document.createElement('span');
    lbl.className = 'vcfg-label';
    lbl.textContent = `${variant.label} — ${fmt(variant.price)}`;

    /* Ô số lượng */
    const qtyWrap = document.createElement('div');
    qtyWrap.className = 'vcfg-qty-wrap';

    const btnMinus = document.createElement('button');
    btnMinus.type = 'button';
    btnMinus.className = 'vcfg-qty-btn';
    btnMinus.textContent = '−';

    const qtyInput = document.createElement('input');
    qtyInput.type  = 'number';
    qtyInput.className = 'vcfg-qty-input';
    qtyInput.min   = 0;
    qtyInput.max   = 99;
    qtyInput.value = qty;
    qtyInput.disabled = !checked; /* Khóa nhập nếu chưa chọn loại cán */

    const btnPlus = document.createElement('button');
    btnPlus.type = 'button';
    btnPlus.className = 'vcfg-qty-btn';
    btnPlus.textContent = '+';

    qtyWrap.appendChild(btnMinus);
    qtyWrap.appendChild(qtyInput);
    qtyWrap.appendChild(btnPlus);

    line.appendChild(cbBox);
    line.appendChild(lbl);
    line.appendChild(qtyWrap);
    wrap.appendChild(line);

    /* ── Helpers cập nhật trạng thái ── */
    function applyQty(newQty) {
      newQty = Math.max(0, Math.min(99, newQty));
      const varMapCur = cart.get(product.id);
      if (!varMapCur) return;
      if (newQty === 0) {
        varMapCur.delete(vKey);
        cbBox.classList.remove('checked');
        qtyInput.disabled = true;
        qtyInput.value = 0;
        /* Nếu không còn variant nào thì bỏ chọn sản phẩm */
        if (varMapCur.size === 0) {
          cart.delete(product.id);
          renderPicker();
        }
      } else {
        varMapCur.set(vKey, newQty);
        cbBox.classList.add('checked');
        qtyInput.disabled = false;
        qtyInput.value = newQty;
      }
      updateCartSummary();
    }

    /* Toggle checkbox loại cán */
    cbBox.addEventListener('click', () => {
      const varMapCur = cart.get(product.id);
      if (!varMapCur) return;
      if (varMapCur.has(vKey)) {
        applyQty(0);
      } else {
        varMapCur.set(vKey, 1);
        cbBox.classList.add('checked');
        qtyInput.disabled = false;
        qtyInput.value = 1;
        updateCartSummary();
      }
    });

    /* Nút − */
    btnMinus.addEventListener('click', () => {
      const cur = parseInt(qtyInput.value) || 0;
      applyQty(cur - 1);
    });

    /* Nút + */
    btnPlus.addEventListener('click', () => {
      const cur = parseInt(qtyInput.value) || 0;
      applyQty(cur + 1);
    });

    /* Nhập trực tiếp */
    qtyInput.addEventListener('change', () => {
      const v = parseInt(qtyInput.value);
      applyQty(isNaN(v) ? 0 : v);
    });
    qtyInput.addEventListener('input', () => {
      /* Ngăn nhập âm trực tiếp */
      if (parseInt(qtyInput.value) < 0) qtyInput.value = 0;
    });
  });

  return wrap;
}

/* Toggle chọn / bỏ chọn sản phẩm */
function toggleCartItem(id) {
  if (cart.has(id)) {
    cart.delete(id);
  } else {
    /* Mặc định: chọn variant đầu tiên với qty = 1 */
    const product  = getProductById(id);
    const firstKey = Object.keys(product.variants)[0];
    const varMap   = new Map();
    varMap.set(firstKey, 1);
    cart.set(id, varMap);
  }
  renderPicker();
  updateCartSummary();
}

/* renderConfigs không còn dùng — đã tích hợp vào renderPicker dạng inline */
function renderConfigs() { /* no-op — inline config trong picker */ }

function updateCartSummary() {
  const sub   = cartSubtotal();
  const ship  = shipFee();
  const total = sub + ship;
  const count = cartTotalQty();

  document.getElementById('cartCount').textContent = cart.size > 0
    ? `Đã chọn: ${cart.size} sản phẩm (${count} cái)`
    : 'Chưa chọn sản phẩm';
  document.getElementById('cartSubtotal').textContent = sub > 0 ? fmt(sub) : '—';
  document.getElementById('cartShip').textContent     = ship === 0 && sub === 0 ? '—'
    : ship === 0 ? 'Miễn phí' : fmt(ship);
  document.getElementById('cartTotal').textContent    = total > 0 ? fmt(total) : '—';

  const noteEl = document.getElementById('cartShipNote');
  if (sub === 0) {
    noteEl.innerHTML = '';
  } else if (ship === 0) {
    noteEl.innerHTML = '<i class="bi bi-check-circle me-1"></i>Miễn phí vận chuyển';
    noteEl.className = 'ship-note';
  } else {
    const need = SHIP_CONFIG.freeThreshold - sub;
    noteEl.innerHTML = `<i class="bi bi-info-circle me-1"></i>Thêm ${fmt(need)} để được miễn ship`;
    noteEl.className = 'ship-note ship-warn';
  }
}

/* ════════════════════════════════════════════════
   J. OPEN MODAL
════════════════════════════════════════════════ */
function openOrderModal(preSelectId, preSelectCat) {
  /* Nếu truyền vào productId thì thêm vào cart trước */
  if (preSelectId && !cart.has(preSelectId)) {
    const product = getProductById(preSelectId);
    if (product) {
      const firstVariant = Object.keys(product.variants)[0];
      const varMap = new Map();
      varMap.set(firstVariant, 1);
      cart.set(preSelectId, varMap);
    }
  }

  renderPicker();
  renderConfigs();
  updateCartSummary();

  /* Reset form */
  document.getElementById('orderForm').reset();
  document.querySelectorAll('.err-msg').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.form-ctrl.error').forEach(e => e.classList.remove('error'));
  document.querySelectorAll('.delivery-btn').forEach(b => b.classList.remove('active'));
  deliveryTime = null;

  /* Reset address */
  resetAddress();

  /* Reset map */
  selectedLat = null; selectedLng = null;
  document.getElementById('coordInfo').textContent = '';

  new bootstrap.Modal(document.getElementById('orderModal')).show();

  /* Init map after modal shown */
  document.getElementById('orderModal').addEventListener('shown.bs.modal', initOrderMap, { once: true });
}

/* Hero + sticky CTA */
document.getElementById('btnHeroOrder')?.addEventListener('click', () => openOrderModal(null, null));

/* ════════════════════════════════════════════════
   K. DELIVERY TIME BUTTONS
════════════════════════════════════════════════ */
document.querySelectorAll('.delivery-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.delivery-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    deliveryTime = btn.dataset.time;
  });
});

/* ════════════════════════════════════════════════
   L. VN ADDRESS — 2 cấp (Tỉnh → Xã/Phường)
      Dùng API provinces.open-api.vn depth=2
════════════════════════════════════════════════ */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function resetAddress() {
  const p = document.getElementById('selProvince');
  const w = document.getElementById('selWard');
  p.innerHTML = '<option value="">-- Chọn Tỉnh/Thành phố --</option>';
  w.innerHTML = '<option value="">-- Chọn Xã/Phường --</option>';
  w.disabled  = true;
  loadProvinces();
}

function loadProvinces() {
  const sel = document.getElementById('selProvince');
  sel.innerHTML = '<option value="">-- Chọn Tỉnh/Thành phố --</option>';
  VN_ADDRESS.forEach((p, idx) => {
    const o = document.createElement('option');
    o.value = idx;          // dùng index làm value
    o.textContent = p.name;
    sel.appendChild(o);
  });
  sel.disabled = false;
} 

document.getElementById('selProvince')?.addEventListener('change', function () {
  const idx = this.value;
  const selW = document.getElementById('selWard');
  selW.innerHTML = '<option value="">-- Chọn Xã/Phường --</option>';
  selW.disabled = true;
  if (idx === '') return;

  const province = VN_ADDRESS[parseInt(idx)];
  if (!province || !province.wards) return;

  province.wards.forEach(wardName => {
    const o = document.createElement('option');
    o.value = wardName;
    o.textContent = wardName;
    selW.appendChild(o);
  });
  selW.disabled = false;
});

/* ════════════════════════════════════════════════
   M. LEAFLET MAP IN MODAL
════════════════════════════════════════════════ */
function initOrderMap() {
  if (orderMap) { orderMap.remove(); orderMap = null; orderMarker = null; }

  orderMap = L.map('orderMap').setView(CONFIG.DEFAULT_COORDS, CONFIG.DEFAULT_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(orderMap);

  const icon = L.divIcon({
    html: '<div style="width:16px;height:16px;background:#6b1a1a;border:2px solid #a02828;border-radius:50%;box-shadow:0 0 8px rgba(107,26,26,.7)"></div>',
    iconSize: [16,16], iconAnchor: [8,8], className: ''
  });

  function setMarker(lat, lng, label) {
    if (orderMarker) orderMap.removeLayer(orderMarker);
    orderMarker = L.marker([lat, lng], { icon }).addTo(orderMap);
    selectedLat = lat; selectedLng = lng;
    document.getElementById('coordInfo').innerHTML =
      `<i class="bi bi-geo-alt-fill" style="color:var(--wine-g)"></i> ${label}: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  orderMap.on('click', e => setMarker(e.latlng.lat, e.latlng.lng, 'Đã chọn'));

  document.getElementById('btnLocateMe').onclick = () => {
    if (!navigator.geolocation) return toast('Trình duyệt không hỗ trợ GPS', 'error');
    const btn = document.getElementById('btnLocateMe');
    btn.textContent = 'Đang lấy...'; btn.disabled = true;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      orderMap.setView([lat, lng], 16);
      setMarker(lat, lng, 'Vị trí hiện tại');
      btn.innerHTML = '<i class="bi bi-geo-alt me-1"></i>Vị trí của tôi';
      btn.disabled = false;
    }, () => {
      toast('Không lấy được vị trí', 'error');
      btn.innerHTML = '<i class="bi bi-geo-alt me-1"></i>Vị trí của tôi';
      btn.disabled = false;
    }, { timeout: 10000 });
  };

  /* Tìm kiếm địa chỉ bằng Nominatim */
  document.getElementById('btnSearchAddr').onclick = async () => {
    const q = document.getElementById('mapSearchInput').value.trim();
    if (!q) return;
    const btn = document.getElementById('btnSearchAddr');
    btn.disabled = true; btn.textContent = '...';
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=vn`);
      const data = await res.json();
      if (data.length) {
        const { lat, lon, display_name } = data[0];
        orderMap.setView([lat, lon], 16);
        setMarker(+lat, +lon, 'Tìm kiếm');
      } else toast('Không tìm thấy địa chỉ', 'error');
    } catch { toast('Lỗi tìm kiếm', 'error'); }
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-search"></i>';
  };

  /* Enter để tìm */
  document.getElementById('mapSearchInput').onkeydown = e => {
    if (e.key === 'Enter') document.getElementById('btnSearchAddr').click();
  };
}

/* ════════════════════════════════════════════════
   N. FORM VALIDATION
════════════════════════════════════════════════ */
function isValidPhone(p) {
  return /^(0[35789]\d{8})$/.test(p.replace(/[\s\-\.]/g, ''));
}

function setErr(id, msg, show) {
  const el  = document.getElementById(id);
  const err = document.getElementById(id + 'Err');
  if (show) { el?.classList.add('error');    err?.classList.add('show');    if (err) err.textContent = msg; }
  else       { el?.classList.remove('error'); err?.classList.remove('show'); }
  return !show;
}

function validateForm() {
  let ok = true;
  ok = setErr('fName',  'Vui lòng nhập họ và tên.',       !document.getElementById('fName').value.trim())  && ok;
  ok = setErr('fPhone', 'SĐT VN không hợp lệ (10 số).',  !isValidPhone(document.getElementById('fPhone').value)) && ok;
  ok = setErr('selProvince', 'Vui lòng chọn tỉnh/thành.', !document.getElementById('selProvince').value)   && ok;
  ok = setErr('selWard',     'Vui lòng chọn xã/phường.',  !document.getElementById('selWard').value)       && ok;
  ok = setErr('fAddress', 'Vui lòng nhập địa chỉ chi tiết.', !document.getElementById('fAddress').value.trim()) && ok;
  return ok;
}

['fName','fPhone','fAddress'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', function() {
    this.classList.remove('error');
    document.getElementById(id + 'Err')?.classList.remove('show');
  });
});
['selProvince','selWard'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', function() {
    this.classList.remove('error');
    document.getElementById(id + 'Err')?.classList.remove('show');
  });
});

/* ════════════════════════════════════════════════
   O. GOOGLE SHEETS
════════════════════════════════════════════════ */
async function sendToSheets(data) {
  try {
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
    });
    return true;
  } catch {
    try {
      const p = new URLSearchParams();
      Object.entries(data).forEach(([k,v]) => p.append(k, v));
      await fetch(`${CONFIG.APPS_SCRIPT_URL}?${p}`, { method: 'GET', mode: 'no-cors' });
      return true;
    } catch(e2) { console.error('Sheets error:', e2); return false; }
  }
}

/* ════════════════════════════════════════════════
   P. BUILD ORDER LINES
   Định dạng: { productName, variantLabel, qty, price }
   Dữ liệu gửi riêng: "Dao chặt gà | Cán sắt | 2"
════════════════════════════════════════════════ */
function buildOrderLines() {
  const lines = [];
  cart.forEach((varMap, id) => {
    const p = getProductById(id);
    if (!p) return;
    varMap.forEach((qty, vKey) => {
      if (qty > 0) {
        const price = p.variants[vKey]?.price || 0;
        const vLabel = p.variants[vKey]?.label || vKey;
        lines.push({ productName: p.name, variantLabel: vLabel, qty, price });
      }
    });
  });
  return lines;
}

/* ════════════════════════════════════════════════
   Q. NÚT ĐẶT HÀNG (footer) — validate rồi show confirm
════════════════════════════════════════════════ */
document.getElementById('btnFooterOrder')?.addEventListener('click', () => {
  /* 1. Kiểm tra sản phẩm */
  const lines = buildOrderLines();
  if (lines.length === 0 || lines.reduce((s, l) => s + l.qty, 0) === 0) {
    toast('Vui lòng chọn ít nhất 1 sản phẩm và nhập số lượng!', 'error');
    /* Cuộn lên phần chọn sản phẩm */
    document.getElementById('pickerWrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  /* 2. Kiểm tra form khách hàng */
  if (!validateForm()) {
    document.querySelector('.form-ctrl.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  /* 3. Hiển thị popup xác nhận */
  showConfirmModal(lines);
});

/* Cũng giữ nút submit gốc (bên trong form) hoạt động như cũ */
document.getElementById('orderForm')?.addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('btnFooterOrder')?.click();
});

/* ════════════════════════════════════════════════
   R. CONFIRM MODAL — hiển thị tóm tắt trước khi gửi
════════════════════════════════════════════════ */
let _pendingOrderData = null; /* Lưu data tạm để gửi sau khi xác nhận */

function showConfirmModal(lines) {
  const selProv = document.getElementById('selProvince');
  const selWard = document.getElementById('selWard');
  const provTxt = selProv.options[selProv.selectedIndex]?.text || '';
  const wardTxt = selWard.options[selWard.selectedIndex]?.text || '';
  const sub     = cartSubtotal();
  const ship    = shipFee();

  /* Xây dựng productLines theo định dạng lưu riêng */
  const productLineStrings = lines.map(l =>
    `${l.productName} | ${l.variantLabel} | ${l.qty}`
  );

  /* Data đầy đủ sẽ gửi nếu xác nhận */
  _pendingOrderData = {
    timestamp:    new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    fullName:     document.getElementById('fName').value.trim(),
    phone:        document.getElementById('fPhone').value.replace(/[\s\-\.]/g, ''),
    province:     provTxt,
    ward:         wardTxt,
    address:      document.getElementById('fAddress').value.trim(),
    deliveryTime: deliveryTime === 'sang' ? 'Buổi sáng' : deliveryTime === 'toi' ? 'Buổi tối' : '',
    email:        document.getElementById('fEmail').value.trim(),
    note:         document.getElementById('fNote').value.trim(),
    /* Lưu từng dòng riêng, nối bằng " | " để tách sau */
    products:     productLineStrings.join(' || '),
    subtotal:     sub,
    shipFee:      ship,
    total:        sub + ship,
    latitude:     selectedLat ? selectedLat.toFixed(6) : '',
    longitude:    selectedLng ? selectedLng.toFixed(6) : '',
    /* Lưu thêm mảng để hiển thị trong success modal */
    _lines:       lines,
    _provTxt:     provTxt,
    _wardTxt:     wardTxt,
  };

  /* Điền nội dung confirm modal */
  const content = document.getElementById('confirmContent');
  content.innerHTML = `
    <table class="confirm-table">
      <tbody>
        <tr><td>Khách hàng</td><td><strong>${_pendingOrderData.fullName}</strong></td></tr>
        <tr><td>Số điện thoại</td><td>${_pendingOrderData.phone}</td></tr>
        <tr><td>Địa chỉ</td><td>${_pendingOrderData.address}, ${wardTxt}, ${provTxt}</td></tr>
        <tr>
          <td style=\"vertical-align:top;padding-top:6px\">Sản phẩm</td>
          <td style=\"padding:0\">
            <div class=\"order-product-table-wrap\">
              <table class=\"order-product-table\">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${lines.map(l => `
                    <tr>
                      <td class=\"opt-name\">${l.productName}<br><span class=\"opt-variant\">${l.variantLabel}</span></td>
                      <td class=\"opt-qty\">${l.qty}</td>
                      <td class=\"opt-price\">${fmt(l.price * l.qty)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
        <tr><td>Tổng số lượng</td><td>${lines.reduce((s,l)=>s+l.qty,0)} cái</td></tr>
        <tr><td>Phí ship</td><td>${ship === 0 ? 'Miễn phí' : fmt(ship)}</td></tr>
        <tr><td><strong>Tổng tiền</strong></td><td><strong style="color:var(--wine-g);font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:300">${fmt(sub + ship)}</strong></td></tr>
      </tbody>
    </table>`;

  /* Hiện confirm modal, ẩn order modal */
  bootstrap.Modal.getInstance(document.getElementById('orderModal'))?.hide();
  setTimeout(() => {
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }, 250);
}

/* Quay lại chỉnh sửa */
document.getElementById('btnConfirmBack')?.addEventListener('click', () => {
  bootstrap.Modal.getInstance(document.getElementById('confirmModal'))?.hide();
  setTimeout(() => {
    new bootstrap.Modal(document.getElementById('orderModal')).show();
  }, 250);
});

/* Xác nhận đặt hàng — gửi dữ liệu */
document.getElementById('btnConfirmSubmit')?.addEventListener('click', async () => {
  if (!_pendingOrderData) return;

  const btn = document.getElementById('btnConfirmSubmit');
  btn.disabled = true;
  btn.classList.add('loading');
  toast('Đang gửi đơn hàng...', 'info');

  const ok = await sendToSheets(_pendingOrderData);
  btn.disabled = false;
  btn.classList.remove('loading');

  if (ok) toast('Đã lưu vào Google Sheets ✓', 'success');
  else    toast('Lưu Sheets có sự cố — nhân viên sẽ gọi xác nhận.', 'error');

  /* Đóng confirm modal */
  bootstrap.Modal.getInstance(document.getElementById('confirmModal'))?.hide();

  /* Điền success modal */
  const d = _pendingOrderData;
  const productLineHTML = `
    <div class="order-product-table-wrap">
      <table class="order-product-table">
        <thead>
          <tr><th>Sản phẩm</th><th>SL</th><th>Thành tiền</th></tr>
        </thead>
        <tbody>
          ${(d._lines || []).map(l => `
            <tr>
              <td class="opt-name">${l.productName}<br><span class="opt-variant">${l.variantLabel}</span></td>
              <td class="opt-qty">${l.qty}</td>
              <td class="opt-price">${fmt(l.price * l.qty)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('sucName').textContent    = d.fullName;
  document.getElementById('sucPhone').textContent   = d.phone;
  document.getElementById('sucAddress').textContent = `${d.address}, ${d._wardTxt}, ${d._provTxt}`;
  document.getElementById('sucProducts').innerHTML  = productLineHTML;
  document.getElementById('sucShip').textContent    = d.shipFee === 0 ? 'Miễn phí' : fmt(d.shipFee);
  document.getElementById('sucTotal').textContent   = fmt(d.total);
  document.getElementById('sucTime').textContent    = d.deliveryTime || 'Không yêu cầu';

  /* Reset toàn bộ sau khi đặt thành công */
  cart.clear();
  document.getElementById('orderForm').reset();
  document.querySelectorAll('.err-msg').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.form-ctrl.error').forEach(e => e.classList.remove('error'));
  document.querySelectorAll('.delivery-btn').forEach(b => b.classList.remove('active'));
  deliveryTime = null;
  selectedLat  = null;
  selectedLng  = null;
  document.getElementById('coordInfo').textContent = '';
  resetAddress();
  _pendingOrderData = null;

  setTimeout(() => new bootstrap.Modal(document.getElementById('successModal')).show(), 400);
});
/* ════════════════════════════════════════════════
   LIGHTBOX — phóng to ảnh sản phẩm
════════════════════════════════════════════════ */
(function initLightbox() {
  const overlay  = document.getElementById('lightboxOverlay');
  const lbImg    = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');

  /* Dùng event delegation — bắt cả ảnh render sau khi filterTab */
  document.getElementById('productGrid').addEventListener('click', e => {
    const img = e.target.closest('.product-img-wrap img');
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeLb() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLb);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
})();

/* ════════════════════════════════════════════════
   ABOUT SLIDESHOW — chuyển ảnh giống hero
════════════════════════════════════════════════ */
(function initAboutSlideshow() {
  const slides = document.querySelectorAll('.about-slide');
  const dotsEl = document.getElementById('aboutDots');
  if (!slides.length || !dotsEl) return;

  let cur = 0, timer;

  /* Tạo dots */
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'adot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Ảnh ' + (i + 1));
    d.addEventListener('click', () => goAbout(i));
    dotsEl.appendChild(d);
  });

  function goAbout(idx) {
    slides[cur].classList.remove('active');
    dotsEl.children[cur].classList.remove('active');
    cur = (idx + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dotsEl.children[cur].classList.add('active');
    clearInterval(timer);
    timer = setInterval(() => goAbout(cur + 1), 4500);
  }

  timer = setInterval(() => goAbout(cur + 1), 4500);
})();