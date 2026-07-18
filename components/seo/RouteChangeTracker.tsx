"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/tracking";

/**
 * Next.js App Router điều hướng phía client (không reload trang), nên trigger
 * "All Pages"/page_view mặc định của GTM chỉ bắt được lần tải đầu tiên. File
 * này bắn 1 event `page_view` ảo mỗi khi pathname đổi để GA4/Meta Pixel nhận
 * đủ mọi lượt xem trang mà KHÔNG đếm trùng lần tải đầu (ref `firstRun` bỏ
 * qua đúng 1 lần chạy đầu tiên — lần đó đã được GTM tự bắn page_view lúc
 * container khởi tạo).
 */
export default function RouteChangeTracker() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    trackPageView(pathname ?? "/");
  }, [pathname]);

  return null;
}
