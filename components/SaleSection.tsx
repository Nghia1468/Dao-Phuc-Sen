"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export default function SaleSection({ saleProducts }: { saleProducts: Product[] }) {
  const [target] = useState(() => Date.now() + 1000 * 60 * 60 * 1); // 1h demo countdown
  const [time, setTime] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    // Nền tối đồng bộ với các khối khác (Bestsellers...) — trước đây nền đỏ rượu
    // khiến ribbon "SALE" (cũng màu đỏ) trên ảnh sản phẩm bị chìm, khó nhìn.
    <section className="py-20 px-5 md:px-8 bg-daoDark/60">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <p className="uppercase tracking-widest2 text-xs text-daoWineLight mb-3">
              Ưu đãi giới hạn
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-daoWhite">Sale</h2>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {saleProducts.map((p) => (
            <ProductCard key={p.id} product={p} badge="sale" />
          ))}
        </div>
      </div>
    </section>
  );
}
