"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatVND } from "@/lib/data";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } =
    useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/45 z-[90]"
            onClick={closeCart}
          />

          {/* drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-daoDark2 z-[95] flex flex-col shadow-[0_18px_50px_rgba(0,0,0,.55)]"
          >
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-daoBorder shrink-0">
              <h2 className="font-display text-xl text-daoWhite">Giỏ hàng của bạn</h2>
              <button
                onClick={closeCart}
                aria-label="Đóng giỏ hàng"
                className="text-daoWhite hover:text-daoWineLight transition-colors"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-daoSilver">
                  <ShoppingBag size={36} strokeWidth={1} />
                  <p className="text-sm">Giỏ hàng của bạn đang trống.</p>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-soft overflow-hidden bg-daoDark shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-daoWhite line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-daoSilver mb-2">
                          {item.category}
                          {item.variantLabel ? ` · ${item.variantLabel}` : ""}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-daoBorder rounded-full">
                            <button
                              className="h-7 w-7 flex items-center justify-center text-daoWhite hover:text-daoWineLight"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              aria-label="Giảm số lượng"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs w-6 text-center text-daoWhite">
                              {item.quantity}
                            </span>
                            <button
                              className="h-7 w-7 flex items-center justify-center text-daoWhite hover:text-daoWineLight"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              aria-label="Tăng số lượng"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-price text-sm font-semibold text-daoWhite">
                            {formatVND(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Xóa sản phẩm"
                        className="text-daoSilver hover:text-daoWineLight self-start"
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-daoBorder px-6 py-5 shrink-0 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-daoSilver">Tạm tính</span>
                  <span className="font-price text-lg font-extrabold text-daoWhite">
                    {formatVND(subtotal)}
                  </span>
                </div>
                <Link
                  href="/thanh-toan"
                  onClick={closeCart}
                  className="block w-full text-center py-3.5 bg-daoWine text-white text-sm tracking-wide rounded-soft hover:bg-daoWineDeep transition-colors duration-300"
                >
                  Thanh toán
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center py-3 text-sm text-daoWhite border border-daoBorder rounded-soft hover:border-daoWine transition-colors duration-300"
                >
                  Tiếp tục mua hàng
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
