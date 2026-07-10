"use client";

import { useEffect, useState } from "react";
import { ChevronUp, Phone, ShoppingBag } from "lucide-react";
import { SITE } from "@/lib/seo";

/** Cuộn mượt, chậm rãi tới toạ độ Y mong muốn (không dùng behavior:"smooth"
 * mặc định của trình duyệt vì tốc độ của nó khá nhanh/giật). */
function slowScrollTo(targetY: number, duration = 900) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  // easeInOutQuad — bắt đầu chậm, tăng tốc giữa chừng, rồi chậm dần khi tới nơi.
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    window.scrollTo(0, startY + distance * ease(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => slowScrollTo(0, 900);

  const goToNewProducts = () => {
    // Trang sản phẩm mới chưa tách riêng — cuộn tới khối "Sản phẩm mới" ở trang chủ.
    const el = document.getElementById("new-products");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY;
      slowScrollTo(y, 900);
    } else {
      window.location.href = "/#new-products";
    }
  };

  return (
    // Thứ tự từ trên xuống dưới: nút cuộn lên đầu trang → Liên hệ → Đặt hàng
    // → Zalo tư vấn (dưới cùng, gần tay người dùng nhất khi cầm điện thoại).
    <div className="fixed bottom-6 right-5 md:right-8 z-40 flex flex-col items-end gap-3">
      {showTop && (
        <button
          onClick={scrollTop}
          aria-label="Lên đầu trang"
          className="h-11 w-11 flex items-center justify-center rounded-full bg-daoDark2 border border-daoBorder text-daoSilverLight hover:text-white hover:border-daoWineLight transition-colors shadow-lg"
        >
          <ChevronUp size={18} />
        </button>
      )}

      <a
        href={`tel:${SITE.phone}`}
        className="flex items-center gap-2 px-4 py-3 rounded-full border border-white/70 bg-daoDark2 text-white text-xs font-semibold tracking-wide shadow-lg hover:bg-daoWine hover:border-daoWine transition-colors"
      >
        <Phone size={14} />
        LIÊN HỆ
      </a>

      <button
        onClick={goToNewProducts}
        className="flex items-center gap-2 px-4 py-3 rounded-full border border-white/70 bg-daoDark2 text-white text-xs font-semibold tracking-wide shadow-lg hover:bg-daoWine hover:border-daoWine transition-colors"
      >
        <ShoppingBag size={14} />
        ĐẶT HÀNG
      </button>

      <a
        href={SITE.social.zalo}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#0068FF] text-white text-xs font-semibold tracking-wide shadow-lg hover:brightness-110 transition"
      >
        <span className="h-5 w-5 flex items-center justify-center rounded-full bg-white text-[#0068FF] font-bold text-[11px]">
          Z
        </span>
        ZALO TƯ VẤN
      </a>
    </div>
  );
}
