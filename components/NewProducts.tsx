"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export default function NewProducts({ products }: { products: Product[] }) {
  const [target] = useState(() => Date.now() + 1000 * 60 * 60 * 1); // 1h đếm ngược
  const [time, setTime] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section id="new-products" className="py-20 px-5 md:px-8 bg-dlSection">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Mới về"
          title="Sản phẩm mới"
          description="Ưu đãi số lượng có hạn, Khách đến trước được trước"
        />

        <div className="flex items-center justify-center gap-2 -mt-6 mb-10">
          {[["Giờ", time.h], ["Phút", time.m], ["Giây", time.s]].map(
            ([label, value]) => (
              <div
                key={label as string}
                className="flex flex-col items-center bg-daoDark2 border border-daoBorder rounded-soft px-4 py-2 min-w-[64px]"
              >
                <span className="font-display text-xl tabular-nums text-daoWhite">
                  {pad(value as number)}
                </span>
                <span className="text-[10px] uppercase tracking-widest2 text-daoSilverMuted">
                  {label}
                </span>
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
