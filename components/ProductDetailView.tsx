"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  Headset,
  PackageCheck,
  Ticket,
  PlayCircle,
} from "lucide-react";
import { formatVND, type Product } from "@/lib/data";
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/youtube";
import { trackViewItem } from "@/lib/tracking";
import type { Review } from "@/lib/reviews";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import ProductCard from "./ProductCard";
import ReviewsPanel from "./ReviewsPanel";

export default function ProductDetailView({
  product,
  related,
  reviews,
}: {
  product: Product;
  related: Product[];
  reviews: Review[];
}) {
  const hasVariants = !!product.variants && product.variants.length > 0;
  const hasVideo = !!product.video;

  // activeImg = -1 nghĩa là đang xem video (luôn đứng đầu gallery nếu có).
  const [activeImg, setActiveImg] = useState(hasVideo ? -1 : 0);
  const [qty, setQty] = useState(1);
  const [variantIndex, setVariantIndex] = useState(0);
  const [tab, setTab] = useState<"desc" | "spec" | "review">("desc");
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const { addItem } = useCart();
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Ghi lại lượt xem sản phẩm cho Dashboard Admin — không chặn UI, lỗi bỏ qua lặng lẽ.
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        category: product.category,
      }),
      keepalive: true,
    }).catch(() => {});

    // GA4 Ecommerce: view_item (đẩy qua GTM → GA4 + Meta Pixel "ViewContent").
    trackViewItem({
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.salePrice ?? product.price,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const selectedVariant = hasVariants ? product.variants![variantIndex] : undefined;
  const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
  const effectiveSalePrice = selectedVariant ? selectedVariant.salePrice : product.salePrice;
  const effectiveStock = selectedVariant?.stock ?? product.stock;

  const handleAddToCart = () => {
    addItem(product, qty, selectedVariant);
    show(
      `Đã thêm "${product.name}"${selectedVariant ? ` (${selectedVariant.label})` : ""} vào giỏ hàng`
    );
  };

  const handleBuyNow = () => {
    addItem(product, qty, selectedVariant);
    router.push("/thanh-toan");
  };

  const discountPct =
    effectiveSalePrice && effectivePrice > 0
      ? Math.round(100 - (effectiveSalePrice / effectivePrice) * 100)
      : 0;

  const roundedRating = product.rating ? Math.round(product.rating) : 0;

  return (
    <div className="overflow-x-hidden pb-24 sm:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-stretch">
        {/* gallery */}
        <div>
          <div
            className="relative aspect-square rounded-softLg overflow-hidden bg-daoDark mb-4 cursor-zoom-in"
            onMouseMove={(e) => {
              if (activeImg === -1) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            {activeImg === -1 && hasVideo ? (
              isYouTubeUrl(product.video!) && getYouTubeEmbedUrl(product.video!) ? (
                <iframe
                  src={getYouTubeEmbedUrl(product.video!)!}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={product.video}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
              )
            ) : (
              <Image
                src={product.images[activeImg]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain transition-transform duration-300 ease-silk cursor-default"
                style={
                  zoom
                    ? { transform: "scale(1.6)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            )}
            {discountPct > 0 && (
              <span className="absolute top-4 left-4 h-14 w-14 flex items-center justify-center rounded-full bg-daoWine text-white text-sm font-semibold shadow-[0_18px_50px_rgba(0,0,0,.55)]">
                -{discountPct}%
              </span>
            )}
          </div>
          {(hasVideo || product.images.length > 1) && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {hasVideo && (
                <button
                  onClick={() => setActiveImg(-1)}
                  className={`relative h-20 w-20 shrink-0 rounded-soft overflow-hidden border-2 bg-black transition-colors ${
                    activeImg === -1 ? "border-daoWineLight" : "border-transparent"
                  }`}
                  aria-label="Xem video sản phẩm"
                >
                  {isYouTubeUrl(product.video!) && getYouTubeThumbnail(product.video!) && (
                    <Image
                      src={getYouTubeThumbnail(product.video!)!}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover opacity-70"
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle size={26} className="text-white drop-shadow" />
                  </span>
                </button>
              )}
              {product.images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImg(i)}
                  className={`relative h-20 w-20 shrink-0 rounded-soft overflow-hidden border-2 bg-daoDark transition-colors ${
                    i === activeImg ? "border-daoWineLight" : "border-transparent"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info — flex-col + mt-auto trust box bên dưới để lấp khoảng trắng bên phải trên desktop */}
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-widest2 text-daoWineLight mb-2">
            {product.category}
          </p>
          {/* Tên sản phẩm — to & nổi bật, nhưng nhỏ hơn trên mobile để không vỡ layout */}
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl md:text-[2.75rem] leading-tight text-daoWhite mb-3 break-words">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-daoSilver">
            {typeof product.rating === "number" && !Number.isNaN(product.rating) && product.rating > 0 && (
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    className={
                      i < roundedRating
                        ? "fill-daoGold text-daoGold"
                        : "fill-transparent text-daoSilverMuted"
                    }
                  />
                ))}
                <span className="ml-1 text-daoWhite font-medium">{product.rating}</span>
              </span>
            )}
            <span>·</span>
            <span>Đã bán {product.sold ?? 0}</span>
            <span>·</span>
            <span>Kho: {effectiveStock}</span>
          </div>

          {/* Giá — nổi bật, đậm, kèm giá gốc gạch ngang. Đổi theo biến thể cán đã chọn. */}
          <div className="flex flex-wrap items-center gap-3 mb-7">
            {effectiveSalePrice ? (
              <>
                <span className="font-price text-2xl sm:text-3xl md:text-4xl font-extrabold text-daoWineLight">
                  {formatVND(effectiveSalePrice)}
                </span>
                <span className="font-price text-base sm:text-lg font-semibold text-daoSilver line-through">
                  {formatVND(effectivePrice)}
                </span>
              </>
            ) : (
              <span className="font-price text-2xl sm:text-3xl md:text-4xl font-extrabold text-daoWhite">
                {formatVND(effectivePrice)}
              </span>
            )}
          </div>

          {/* Chọn tuỳ biến — tên do người bán tự đặt (Cán Sắt/Cán Gỗ/Size.../...), mỗi loại giá riêng.
              Có thể đặt cùng lúc
              cả 2 loại bằng cách thêm vào giỏ lần lượt (mỗi loại là 1 dòng riêng). */}
          {hasVariants && (
            <div className="mb-7">
              <p className="text-sm text-daoWhite mb-2.5">
                Tuỳ chọn: <span className="font-medium">{selectedVariant?.label}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.variants!.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantIndex(i)}
                    className={`px-5 py-2.5 text-sm rounded-full border-2 transition-colors ${
                      variantIndex === i
                        ? "bg-daoWine text-white border-daoSilver"
                        : "border-daoBorder text-daoWhite hover:border-daoWine"
                    }`}
                  >
                    {v.label} · <span className="font-price font-semibold">{formatVND(v.salePrice ?? v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* quantity — to hơn trên desktop, gọn hơn trên mobile */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-daoWhite">Số lượng</span>
            <div className="flex items-center border-2 border-daoBorder rounded-full">
              <button
                className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-daoWhite hover:text-daoWineLight"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm sm:text-base w-8 sm:w-10 text-center font-medium">{qty}</span>
              <button
                className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-daoWhite hover:text-daoWineLight"
                onClick={() => setQty((q) => Math.min(effectiveStock, q + 1))}
                aria-label="Tăng số lượng"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* CTA desktop — trên mobile ẩn đi, thay bằng thanh cố định dưới cùng màn hình */}
          <div className="hidden sm:flex flex-row gap-3 mb-6">
            <button
              onClick={handleBuyNow}
              className="flex-1 min-w-0 py-4 bg-daoWine text-white text-base font-medium tracking-wide rounded-full hover:bg-daoWineDeep transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,.45)]"
            >
              Mua ngay
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 min-w-0 py-4 border-2 border-daoWine text-daoWineLight text-base font-medium tracking-wide rounded-full hover:bg-daoWine hover:text-white transition-colors duration-300"
            >
              Thêm vào giỏ
            </button>
          </div>

          {/* gợi ý mã giảm giá — điền khoảng trống + nhắc khách có ưu đãi */}
          <a
            href="/thanh-toan"
            className="flex items-center gap-2 text-sm text-daoWineLight hover:underline mb-8"
          >
            <Ticket size={15} />
            Có mã giảm giá áp dụng được cho đơn hàng này — xem ở trang thanh toán
          </a>

          {/* trust badges — đẩy xuống sát đáy cột phải bằng mt-auto, lấp khoảng trắng bên phải trên desktop */}
          <div className="mt-auto rounded-softLg border-2 border-daoBorder p-3 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Truck size={18} className="text-daoWineLight shrink-0" strokeWidth={1.5} />
                <span className="text-[11px] text-daoSilver leading-tight">
                  Miễn phí vận chuyển
                  <br />
                  đơn từ 500k
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <PackageCheck size={18} className="text-daoWineLight shrink-0" strokeWidth={1.5} />
                <span className="text-[11px] text-daoSilver leading-tight">
                  Miễn phí kiểm tra
                  <br />
                  ưng ý mới nhận
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Headset size={18} className="text-daoWineLight shrink-0" strokeWidth={1.5} />
                <span className="text-[11px] text-daoSilver leading-tight">
                  Hỗ trợ 24/7
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck size={18} className="text-daoWineLight shrink-0" strokeWidth={1.5} />
                <span className="text-[11px] text-daoSilver leading-tight">
                  Giao hàng
                  <br />
                  siêu tốc
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-16">
        <div className="flex gap-8 border-b border-daoBorder mb-6">
          {[
            { key: "desc", label: "Mô tả" },
            { key: "spec", label: "Thông số" },
            { key: "review", label: `Đánh giá (${reviews.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`pb-3 text-sm tracking-wide transition-colors relative ${
                tab === t.key ? "text-daoWhite" : "text-daoSilver"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-daoWine" />
              )}
            </button>
          ))}
        </div>

        {tab === "desc" && (
          // whitespace-pre-line: giữ đúng các dòng xuống dòng người bán đã nhập ở Admin,
          // thay vì gộp thành 1 đoạn văn liền như trước.
          <p className="text-sm text-daoSilver font-light leading-relaxed max-w-2xl whitespace-pre-line">
            {product.description}
          </p>
        )}
        {tab === "spec" && (
          <ul className="text-sm text-daoSilver font-light space-y-2 max-w-md">
            <li className="flex justify-between border-b border-daoBorder pb-2">
              <span>Danh mục</span>
              <span className="text-daoWhite text-right">{product.category}</span>
            </li>
            {product.specs?.steelType && (
              <li className="flex justify-between border-b border-daoBorder pb-2">
                <span>Loại thép</span>
                <span className="text-daoWhite text-right">{product.specs.steelType}</span>
              </li>
            )}
            {product.specs?.bladeLength && (
              <li className="flex justify-between border-b border-daoBorder pb-2">
                <span>Chiều dài lưỡi</span>
                <span className="text-daoWhite text-right">{product.specs.bladeLength}</span>
              </li>
            )}
            {product.specs?.bladeWidth && (
              <li className="flex justify-between border-b border-daoBorder pb-2">
                <span>Bản rộng</span>
                <span className="text-daoWhite text-right">{product.specs.bladeWidth}</span>
              </li>
            )}
            {product.specs?.handleLength && (
              <li className="flex justify-between border-b border-daoBorder pb-2">
                <span>Chiều dài cán</span>
                <span className="text-daoWhite text-right">{product.specs.handleLength}</span>
              </li>
            )}
            {product.specs?.thickness && (
              <li className="flex justify-between border-b border-daoBorder pb-2">
                <span>Độ dày</span>
                <span className="text-daoWhite text-right">{product.specs.thickness}</span>
              </li>
            )}
            {product.specs?.weight && (
              <li className="flex justify-between border-b border-daoBorder pb-2">
                <span>Trọng lượng</span>
                <span className="text-daoWhite text-right">{product.specs.weight}</span>
              </li>
            )}
            {product.specs?.handleMaterial && (
              <li className="flex justify-between border-b border-daoBorder pb-2">
                <span>Chất liệu cán</span>
                <span className="text-daoWhite text-right">{product.specs.handleMaterial}</span>
              </li>
            )}
            {product.specs?.origin && (
              <li className="flex justify-between border-b border-daoBorder pb-2">
                <span>Xuất xứ</span>
                <span className="text-daoWhite text-right">{product.specs.origin}</span>
              </li>
            )}
            {product.specs?.warranty && (
              <li className="flex justify-between">
                <span>Bảo hành</span>
                <span className="text-daoWhite text-right">{product.specs.warranty}</span>
              </li>
            )}
          </ul>
        )}
        {tab === "review" && (
          <ReviewsPanel productId={product.id} initialReviews={reviews} />
        )}
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl text-daoWhite mb-8 text-center">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Thanh nút cố định dưới cùng màn hình — chỉ mobile, luôn 1 hàng */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex gap-2 p-3 bg-daoDark2 border-t border-daoBorder shadow-[0_-4px_15px_rgba(0,0,0,0.06)]">
        <button
          onClick={handleBuyNow}
          className="flex-1 min-w-0 py-3.5 bg-daoWine text-white text-sm font-medium tracking-wide rounded-full active:bg-daoWineDeep"
        >
          Mua ngay
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 min-w-0 py-3.5 border-2 border-daoWine text-daoWineLight text-sm font-medium tracking-wide rounded-full"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
