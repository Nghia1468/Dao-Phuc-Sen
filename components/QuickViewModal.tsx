"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatVND, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";

export default function QuickViewModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const hasVariants = !!product.variants && product.variants.length > 0;
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [variantIndex, setVariantIndex] = useState(0);
  const { addItem } = useCart();
  const { show } = useToast();
  const router = useRouter();

  const selectedVariant = hasVariants ? product.variants![variantIndex] : undefined;
  const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
  const effectiveSalePrice = selectedVariant ? selectedVariant.salePrice : product.salePrice;
  const effectiveStock = selectedVariant?.stock ?? product.stock;

  const handleAddToCart = () => {
    addItem(product, qty, selectedVariant);
    show(`Đã thêm "${product.name}" vào giỏ hàng`);
    onClose();
  };

  const handleBuyNow = () => {
    addItem(product, qty, selectedVariant);
    onClose();
    router.push("/thanh-toan");
  };

  const specRows = [
    ["Lưỡi dao", product.specs?.bladeLength],
    ["Bản rộng", product.specs?.bladeWidth],
    ["Độ dày", product.specs?.thickness],
    ["Chiều dài cán", product.specs?.handleLength],
    ["Trọng lượng", product.specs?.weight],
    ["Chất liệu", product.specs?.handleMaterial],
  ].filter(([, v]) => !!v) as [string, string][];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[111] flex items-center justify-center p-0 sm:p-4"
            onClick={onClose}
          >
            <div
              className="bg-daoDark2 sm:rounded-softLg max-w-3xl w-full h-full sm:h-auto sm:max-h-[88vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-0 shadow-[0_18px_50px_rgba(0,0,0,.55)] relative pb-20 sm:pb-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                aria-label="Đóng"
                className="absolute top-4 right-4 z-20 h-9 w-9 flex items-center justify-center bg-daoBlack/90 rounded-full text-daoWhite hover:text-daoWineLight transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              {/* gallery */}
              <div className="p-4 sm:p-6">
                <div className="relative aspect-square rounded-soft overflow-hidden bg-daoDark mb-3">
                  <Image
                    src={product.images[activeImg]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((src, i) => (
                      <button
                        key={src + i}
                        onClick={() => setActiveImg(i)}
                        className={`relative h-16 w-16 shrink-0 rounded-soft overflow-hidden border-2 bg-daoDark transition-colors ${
                          i === activeImg ? "border-daoWineLight" : "border-transparent"
                        }`}
                      >
                        <Image src={src} alt="" fill sizes="64px" className="object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* info */}
              <div className="p-4 sm:p-6 md:pr-8 flex flex-col">
                <p className="text-xs uppercase tracking-widest2 text-daoWineLight mb-2">
                  {product.category}
                </p>
                <h2 className="font-display text-lg sm:text-2xl text-daoWhite mb-2 break-words">{product.name}</h2>

                {typeof product.rating === "number" && !Number.isNaN(product.rating) && product.rating > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={14} className="fill-daoGold text-daoGold" />
                    <span className="text-sm text-daoSilver">
                      {product.rating}
                      {typeof product.reviewCount === "number" && product.reviewCount > 0
                        ? ` (${product.reviewCount} đánh giá)`
                        : ""}
                      {" · "}Đã bán {product.sold ?? 0}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {effectiveSalePrice ? (
                    <>
                      <span className="font-display text-lg sm:text-2xl text-daoWineLight">
                        {formatVND(effectiveSalePrice)}
                      </span>
                      <span className="text-sm text-daoSilver line-through">
                        {formatVND(effectivePrice)}
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-lg sm:text-2xl text-daoWhite">
                      {formatVND(effectivePrice)}
                    </span>
                  )}
                </div>

                {/* Thông số kỹ thuật đầy đủ — lưỡi dao, bản rộng, độ dày, cán, trọng lượng, chất liệu */}
                {specRows.length > 0 && (
                  <ul className="text-sm text-daoSilver font-light space-y-1.5 mb-5">
                    {specRows.map(([label, value]) => (
                      <li key={label} className="flex justify-between border-b border-daoBorder pb-1.5">
                        <span>{label}</span>
                        <span className="text-daoWhite text-right">{value}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {hasVariants && (
                  <div className="mb-5">
                    <p className="text-sm text-daoWhite mb-2">
                      Loại cán: <span className="font-medium">{selectedVariant?.label}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants!.map((v, i) => (
                        <button
                          key={v.handleType}
                          onClick={() => setVariantIndex(i)}
                          className={`px-4 py-2 text-xs rounded-full border-2 transition-colors ${
                            variantIndex === i
                              ? "bg-daoWine text-white border-daoSilver"
                              : "border-daoBorder text-daoWhite hover:border-daoWine"
                          }`}
                        >
                          {v.label} · {formatVND(v.salePrice ?? v.price)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-daoSilver mb-5">
                  Kho: {effectiveStock > 0 ? `${effectiveStock} sản phẩm` : "Hết hàng"}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm text-daoWhite">Số lượng</span>
                  <div className="flex items-center border border-daoBorder rounded-full">
                    <button
                      className="h-8 w-8 flex items-center justify-center text-daoWhite hover:text-daoWineLight"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Giảm số lượng"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm w-8 text-center text-daoWhite">{qty}</span>
                    <button
                      className="h-8 w-8 flex items-center justify-center text-daoWhite hover:text-daoWineLight"
                      onClick={() => setQty((q) => Math.min(effectiveStock, q + 1))}
                      aria-label="Tăng số lượng"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* CTA desktop — trên mobile ẩn đi, thay bằng thanh cố định dưới cùng màn hình */}
                <div className="hidden sm:flex flex-row gap-3 mt-auto">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 min-w-0 py-3 bg-daoWine text-white text-sm tracking-wide rounded-soft hover:bg-daoWineDeep transition-colors duration-300"
                  >
                    Mua ngay
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 min-w-0 py-3 border border-daoWine text-daoWineLight text-sm tracking-wide rounded-soft hover:bg-daoWine hover:text-white transition-colors duration-300"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>

              {/* Thanh nút cố định dưới cùng màn hình — chỉ mobile */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[112] flex gap-2 p-3 bg-daoDark2 border-t border-daoBorder">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 min-w-0 py-3.5 bg-daoWine text-white text-sm font-medium tracking-wide rounded-full"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
