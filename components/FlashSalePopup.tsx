"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Zap, Copy, Check } from "lucide-react";

export default function FlashSalePopup() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Hiện sau 30 giây kể từ khi vào web. Component này chỉ mount 1 lần ở
    // root layout nên không tự lặp lại khi chuyển trang trong lúc điều hướng
    // (Next.js không remount layout), nhưng sẽ luôn hiện lại mỗi khi người
    // dùng tải lại trang/mở tab mới — trước đây có cờ sessionStorage khiến
    // popup chỉ bật đúng 1 lần rồi im luôn ở các lần thử sau, gây cảm giác
    // "mất tích" sau 30 giây.
    const timer = setTimeout(() => {
      setOpen(true);
    }, 30000); // 30 giây sau khi vào web
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("FREESHIP").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-5"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative bg-daoDark2 rounded-softLg max-w-sm w-full overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,.55)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center bg-daoBlack/90 rounded-full text-daoWhite hover:text-daoWineLight transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>

              <div className="bg-gradient-to-br from-[#8B0000] to-[#3d0000] text-white text-center px-6 py-8">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-[#FF7A00] flex items-center justify-center">
                  <Zap size={22} fill="white" className="text-white" />
                </div>
                <p className="uppercase tracking-widest2 text-xs text-white/70 mb-1">
                  Ưu đãi giới hạn hôm nay
                </p>
                <h3 className="font-display text-2xl">Flash Sale đang diễn ra!</h3>
                <p className="text-sm text-white/80 mt-1">
                  Giảm giá sốc, số lượng có hạn — kết thúc trong 1 giờ tới.
                </p>
              </div>

              <div className="px-6 py-6 text-center">
                <p className="text-sm text-daoSilver mb-3">
                  Nhập mã bên dưới để được <strong className="text-daoWhite">miễn phí vận chuyển</strong> cho đơn hàng của bạn:
                </p>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-between gap-3 border-2 border-dashed border-daoWine rounded-soft px-4 py-3 mb-4 hover:bg-daoDark3/60 transition-colors"
                >
                  <span className="font-display text-lg tracking-widest text-daoWineLight">
                    FREESHIP
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-daoSilver">
                    {copied ? (
                      <>
                        <Check size={14} className="text-green-600" /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Sao chép
                      </>
                    )}
                  </span>
                </button>
                <Link
                  href="/sale"
                  onClick={() => setOpen(false)}
                  className="block w-full py-3 bg-daoWine text-white text-sm font-medium tracking-wide rounded-full hover:bg-daoWineDeep transition-colors"
                >
                  Xem Flash Sale ngay
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
