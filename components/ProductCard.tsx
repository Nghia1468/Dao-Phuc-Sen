"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Eye, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatVND, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import QuickViewModal from "./QuickViewModal";

export default function ProductCard({
  product,
  badge,
  variant = "light",
}: {
  product: Product;
  badge?: "sale" | "best-seller";
  /** "dark" dùng khi card nằm trên nền tối (vd: khu vực Flash Sale). */
  variant?: "light" | "dark";
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMultiple = product.images.length > 1;
  const { addItem } = useCart();
  const { show } = useToast();
  const href = `/san-pham/${product.id}`;

  const discountPct =
    product.salePrice && product.price > 0
      ? Math.round(100 - (product.salePrice / product.price) * 100)
      : 0;

  // Chỉ hiện badge phụ (Mới/Sắp hết hàng) khi không có badge sale/best-seller
  // truyền từ khu vực cha, để tránh chồng chéo quá nhiều nhãn trên 1 ảnh.
  const autoBadge: { label: string; className: string } | null = badge
    ? null
    : product.isNew
    ? { label: "Mới", className: "bg-badgeNew" }
    : product.stock > 0 && product.stock <= 5
    ? { label: "Sắp hết hàng", className: "bg-badgeLimited" }
    : null;

  const startSlideshow = () => {
    setHovered(true);
    if (!hasMultiple) return;
    intervalRef.current = setInterval(() => {
      setImgIndex((i) => (i + 1) % product.images.length);
    }, 1100);
  };

  const stopSlideshow = () => {
    setHovered(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setImgIndex(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    show(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((v) => !v);
  };

  // Thông số nhanh — KHÔNG gồm mô tả (mô tả hiển thị riêng 1 dòng bên dưới).
  const specLines = [
    product.specs?.bladeLength ? { label: "Lưỡi dao", value: product.specs.bladeLength } : null,
    product.specs?.bladeWidth ? { label: "Bản rộng", value: product.specs.bladeWidth } : null,
    product.specs?.thickness ? { label: "Độ dày", value: product.specs.thickness } : null,
    product.specs?.handleLength ? { label: "Cán", value: product.specs.handleLength } : null,
    product.specs?.weight ? { label: "Trọng lượng", value: product.specs.weight } : null,
    product.specs?.steelType ? { label: "Chất liệu", value: product.specs.steelType } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const description = product.shortDescription || product.description;

  const isDark = variant === "dark";
  const hasRatingOrSold =
    (typeof product.rating === "number" && product.rating > 0) ||
    (typeof product.sold === "number" && product.sold > 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={`group relative rounded-softLg overflow-hidden transition-all duration-300 ease-silk flex flex-col ${
          isDark
            ? "bg-daoDark2/[0.04] border border-white/10 hover:border-white/20"
            : "bg-daoDark2 border border-daoBorder shadow-[0_8px_24px_rgba(0,0,0,.45)] hover:shadow-[0_18px_50px_rgba(0,0,0,.55)] hover:border-daoWineLight"
        } hover:-translate-y-1`}
        onMouseEnter={startSlideshow}
        onMouseLeave={stopSlideshow}
      >
        <Link href={href} className="block">
          {/* Khung ảnh mặc định hình vuông */}
          <div className="relative aspect-square overflow-hidden bg-daoDark">
            {product.images.map((src, i) => (
              <Image
                key={src + i}
                src={src}
                alt={product.name}
                title={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className={`object-contain transition-[opacity,transform] duration-[1200ms] ease-silk ${
                  hovered ? "scale-[1.05]" : "scale-100"
                }`}
                style={{ opacity: i === imgIndex ? 1 : 0 }}
                priority={i === 0}
              />
            ))}

            {/* Gradient mờ đáy ảnh — giúp badge/chữ nổi bật hơn */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

            {/* Ribbon Sale góc trên phải — chỉ hiện với sản phẩm Flash Sale */}
            {badge === "sale" && discountPct > 0 && (
              <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                <div className="absolute top-[18px] right-[-32px] w-[140px] rotate-45 bg-daoWine text-white text-[10px] font-bold tracking-wider text-center py-1 shadow-[0_8px_24px_rgba(0,0,0,.45)]">
                  SALE
                </div>
              </div>
            )}

            {/* badges góc trên trái */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {badge === "sale" && discountPct > 0 && (
                <span className="bg-discount text-white text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full shadow-[0_8px_24px_rgba(0,0,0,.45)]">
                  -{discountPct}%
                </span>
              )}
              {badge === "best-seller" && (
                <span className="bg-badgeBestSeller text-white text-[11px] tracking-wide px-2.5 py-1 rounded-full shadow-[0_8px_24px_rgba(0,0,0,.45)]">
                  Best Seller
                </span>
              )}
              {autoBadge && (
                <span
                  className={`${autoBadge.className} text-white text-[11px] tracking-wide px-2.5 py-1 rounded-full shadow-[0_8px_24px_rgba(0,0,0,.45)]`}
                >
                  {autoBadge.label}
                </span>
              )}
            </div>

            {/* Yêu thích — góc trên phải khi không có ribbon sale che chỗ */}
            {!(badge === "sale" && discountPct > 0) && (
              <button
                onClick={handleLike}
                aria-label="Yêu thích"
                className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-daoBlack/90 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,.45)] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Heart
                  size={14}
                  className={liked ? "fill-daoWineLight text-daoWineLight" : "text-daoWhite"}
                  strokeWidth={1.5}
                />
              </button>
            )}

            {/* hover actions */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 sm:gap-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-silk p-2 sm:p-3 z-10">
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-0 flex items-center justify-center gap-1 bg-daoBlack/95 hover:bg-daoWine hover:text-white text-daoWhite text-[10px] sm:text-xs tracking-wide py-2 sm:py-2.5 px-1 rounded-full shadow-[0_8px_24px_rgba(0,0,0,.45)] transition-colors whitespace-nowrap overflow-hidden"
                aria-label="Thêm vào giỏ"
              >
                <ShoppingBag size={12} strokeWidth={1.5} className="shrink-0 hidden sm:inline" />
                Thêm vào giỏ
              </button>
              <button
                onClick={handleQuickView}
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 flex items-center justify-center bg-daoBlack/95 hover:bg-daoWine hover:text-white text-daoWhite rounded-full shadow-[0_8px_24px_rgba(0,0,0,.45)] transition-colors"
                aria-label="Xem nhanh"
              >
                <Eye size={15} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 pb-2 space-y-2">
            {/* Danh mục (trái) + Đánh giá sao/đã bán (phải) — cùng 1 hàng,
                không để sao/đã bán rơi xuống dòng riêng bên dưới nữa. */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`h-1 w-1 rounded-full shrink-0 ${isDark ? "bg-daoGold" : "bg-daoWineLight"}`} />
                <p
                  className={`text-[10px] uppercase tracking-widest2 truncate ${
                    isDark ? "text-white/55" : "text-daoSilverMuted"
                  }`}
                >
                  {product.category}
                </p>
              </div>

              {hasRatingOrSold && (
                <div className="flex items-center flex-wrap justify-end gap-x-1.5 gap-y-0.5 shrink-0">
                  {typeof product.rating === "number" && !Number.isNaN(product.rating) && product.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-daoGold text-daoGold" />
                      <span className={`text-xs font-medium ${isDark ? "text-white/80" : "text-daoWhite"}`}>
                        {product.rating}
                      </span>
                    </span>
                  )}
                  {typeof product.reviewCount === "number" && product.reviewCount > 0 && (
                    <span className={`text-xs ${isDark ? "text-white/45" : "text-daoSilverMuted"}`}>
                      ({product.reviewCount})
                    </span>
                  )}
                  {typeof product.sold === "number" && product.sold > 0 && (
                    <>
                      <span className={`text-xs ${isDark ? "text-white/30" : "text-daoSilverMuted"}`}>·</span>
                      <span className={`text-xs ${isDark ? "text-white/45" : "text-soldText"}`}>
                        Đã bán {product.sold.toLocaleString("vi-VN")}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Tên sản phẩm */}
            <h3
              className={`text-sm font-medium leading-snug line-clamp-1 ${
                isDark ? "text-white" : "text-daoWhite"
              }`}
            >
              {product.name}
            </h3>

            {/* Thông số nhanh — lưới 2 cột: lưỡi dao, bản rộng, độ dày, cán, trọng lượng, chất liệu */}
            {specLines.length > 0 && (
              <dl
                className={`grid grid-cols-2 gap-x-2 gap-y-1 text-[10.5px] leading-tight pt-1.5 border-t ${
                  isDark ? "border-white/10" : "border-daoBorder"
                }`}
              >
                {specLines.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <dt className={isDark ? "text-white/40" : "text-daoSilverMuted"}>{s.label}</dt>
                    <dd className={`font-medium ${isDark ? "text-white/75" : "text-daoSilver"}`}>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Mô tả — luôn để RIÊNG 1 dòng, tách biệt khỏi khối thông số phía trên */}
            {description && (
              <p
                className={`text-[11px] leading-snug line-clamp-2 pt-1.5 border-t ${
                  isDark ? "border-white/10 text-white/50" : "border-daoBorder text-daoSilverMuted"
                }`}
              >
                {description}
              </p>
            )}
          </div>
        </Link>

        {/* Giá + nút Mua ngay — nằm ngoài Link bao ảnh/thông tin để đặt nút bấm
            riêng, bấm "Mua ngay" sẽ chuyển thẳng sang trang chi tiết sản phẩm. */}
        <div
          className={`mt-auto px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-2 flex items-center justify-between gap-2 border-t ${
            isDark ? "border-white/10" : "border-daoBorder"
          }`}
        >
          <div className="flex items-baseline gap-2 min-w-0">
            {product.salePrice ? (
              <>
                <span
                  className={`font-price text-base font-extrabold ${
                    isDark ? "text-daoGoldLight" : "text-daoWineLight"
                  }`}
                >
                  {formatVND(product.salePrice)}
                </span>
                <span
                  className={`font-price text-xs font-semibold line-through ${
                    isDark ? "text-white/35" : "text-daoSilverMuted"
                  }`}
                >
                  {formatVND(product.price)}
                </span>
              </>
            ) : (
              <span
                className={`font-price text-base font-extrabold ${
                  isDark ? "text-white" : "text-daoWineLight"
                }`}
              >
                {formatVND(product.price)}
              </span>
            )}
          </div>

          <Link
            href={href}
            className={`shrink-0 flex items-center gap-1 text-xs font-medium px-3.5 py-2 rounded-full transition-colors duration-200 ${
              isDark
                ? "bg-daoDark2 text-daoWhite hover:bg-daoBlack/90"
                : "bg-daoWine text-white hover:bg-daoWineDeep"
            }`}
          >
            Mua ngay
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </motion.div>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
