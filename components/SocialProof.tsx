"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { PocketKnife, Star, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Social Proof — 2 loại popup xen kẽ (mua hàng / đánh giá), dữ liệu lấy từ
// /api/social-proof (sản phẩm thật + Reviews đã duyệt trên Google Sheets).
//
// Hiệu năng & SEO: chỉ fetch 1 lần khi mount (client-only), không render gì
// ở server (trả về null nếu chưa có dữ liệu) nên không ảnh hưởng SSR/SEO;
// toàn bộ vòng lặp hiển thị chạy bằng setTimeout ở client, không polling.
// ---------------------------------------------------------------------------

interface PurchaseNotification {
  type: "purchase";
  id: string;
  customerName: string;
  productName: string;
  productImage: string | null;
  productId: string;
  quantity: number;
  minutesAgo: number;
}

interface ReviewNotification {
  type: "review";
  id: string;
  customerName: string;
  productName: string;
  productImage: string | null;
  productId: string;
  rating: number;
  comment: string;
  minutesAgo: number;
}

type Notification = PurchaseNotification | ReviewNotification;

const MIN_DELAY_MS = 30_000;
const MAX_DELAY_MS = 60_000;
const VISIBLE_MS = 6_000;

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

export default function SocialProof() {
  const [queue, setQueue] = useState<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/social-proof")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.notifications)) {
          setQueue(data.notifications);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const scheduleNext = useCallback(
    (delay: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setQueue((q) => {
          if (q.length === 0) return q;
          const next = q[indexRef.current % q.length];
          indexRef.current += 1;
          setCurrent(next);
          // Tự ẩn sau 6 giây, rồi hẹn lượt tiếp theo sau 30–60 giây.
          timerRef.current = setTimeout(() => {
            setCurrent(null);
            scheduleNext(randomDelay());
          }, VISIBLE_MS);
          return q;
        });
      }, delay);
    },
    []
  );

  useEffect(() => {
    if (queue.length === 0) return;
    scheduleNext(randomDelay());
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length > 0]);

  const dismiss = () => {
    setCurrent(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    scheduleNext(randomDelay());
  };

  return (
    <div
      className="fixed z-[150] pointer-events-none
        top-3 left-3 right-3 sm:right-auto
        sm:top-auto sm:bottom-5 sm:left-5"
    >
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-auto w-full sm:w-[340px] bg-daoDark2 border border-daoBorder rounded-softLg shadow-[0_18px_50px_rgba(0,0,0,.55)] p-3.5 flex gap-3 items-start"
          >
            <Link
              href={`/san-pham/${current.productId}`}
              className="relative h-12 w-12 shrink-0 rounded-soft overflow-hidden bg-daoDark flex items-center justify-center"
            >
              {current.productImage ? (
                <Image
                  src={current.productImage}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              ) : (
                <PocketKnife size={20} className="text-daoWineLight" strokeWidth={1.5} />
              )}
            </Link>

            <Link href={`/san-pham/${current.productId}`} className="min-w-0 flex-1">
              {current.type === "purchase" ? (
                <>
                  <p className="text-xs text-daoWhite leading-snug">
                    <span className="font-medium">{current.customerName}</span> vừa mua{" "}
                    <span className="font-medium">{current.quantity}</span>{" "}
                    <span className="text-daoWineLight">{current.productName}</span>
                  </p>
                  <p className="text-[11px] text-daoSilverMuted mt-1">
                    {current.minutesAgo} phút trước
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-daoWhite">{current.customerName}</span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={i < current.rating ? "fill-daoGold text-daoGold" : "text-daoBorder"}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="text-[11px] text-daoWineLight mt-0.5">{current.productName}</p>
                  <p className="text-xs text-daoSilver font-light leading-snug mt-1 line-clamp-2">
                    &ldquo;{current.comment}&rdquo;
                  </p>
                  <p className="text-[11px] text-daoSilverMuted mt-1">
                    {current.minutesAgo} phút trước
                  </p>
                </>
              )}
            </Link>

            <button
              onClick={dismiss}
              aria-label="Đóng"
              className="shrink-0 text-daoSilverMuted hover:text-daoWhite transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
