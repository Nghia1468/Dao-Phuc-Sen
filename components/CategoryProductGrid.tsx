"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/data";

const PAGE_SIZE = 15; // 5 cột x 3 hàng

type FilterKey = "all" | "sale" | "best-seller" | "new" | "in-stock";
type SortKey = "az" | "price-asc" | "price-desc" | "rating";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Mới nhất" },
  { key: "best-seller", label: "Bán chạy" },
  { key: "sale", label: "Giảm giá" },
  { key: "in-stock", label: "Còn hàng" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "az", label: "Tên A-Z" },
  { key: "price-asc", label: "Giá tăng dần" },
  { key: "price-desc", label: "Giá giảm dần" },
  { key: "rating", label: "Đánh giá cao nhất" },
];

export default function CategoryProductGrid({
  products,
}: {
  products: Product[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("az");
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [page, setPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (filter === "sale") list = list.filter((p) => p.isSale);
    if (filter === "best-seller") list = list.filter((p) => p.isBestSeller);
    if (filter === "new") list = list.filter((p) => p.isNew);
    if (filter === "in-stock") list = list.filter((p) => p.stock > 0);
    list = list.filter((p) => (p.salePrice ?? p.price) <= maxPrice);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case "price-desc":
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }
    return list;
  }, [products, filter, sort, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeFilter = (key: FilterKey) => {
    setFilter(key);
    setPage(1);
  };

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={15} className="text-daoSilver mr-1" strokeWidth={1.5} />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => changeFilter(f.key)}
              className={`text-xs tracking-wide px-4 py-2 rounded-full border transition-colors duration-300 ${
                filter === f.key
                  ? "bg-daoWine text-white border-daoSilver"
                  : "border-daoBorder text-daoWhite hover:border-daoWine"
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-daoSilver whitespace-nowrap">
              Giá ≤ {maxPrice.toLocaleString("vi-VN")}₫
            </span>
            <input
              type="range"
              min={50000}
              max={10000000}
              step={100000}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
              className="accent-daoWine w-32"
            />
          </div>
        </div>

        {/* sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-2 text-xs px-4 py-2 border border-daoBorder rounded-full text-daoWhite hover:border-daoWine transition-colors"
          >
            Sắp xếp: {SORTS.find((s) => s.key === sort)?.label}
            <ChevronDown size={13} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-daoDark2 border border-daoBorder rounded-soft shadow-[0_18px_50px_rgba(0,0,0,.55)] z-20 overflow-hidden">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setSort(s.key);
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left text-xs px-4 py-2.5 hover:bg-daoDark transition-colors ${
                    sort === s.key ? "text-daoWineLight" : "text-daoWhite"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {paged.length === 0 ? (
        <p className="text-center text-sm text-daoSilver py-20">
          Không có sản phẩm phù hợp với bộ lọc hiện tại.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-6">
          {paged.map((p) => (
            <ProductCard key={p.id} product={p} badge={p.isSale ? "sale" : p.isBestSeller ? "best-seller" : undefined} />
          ))}
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 rounded-full text-sm transition-colors ${
                page === n
                  ? "bg-daoWine text-white"
                  : "border border-daoBorder text-daoWhite hover:border-daoWine"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
