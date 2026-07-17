"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Ticket, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VoucherListModal from "@/components/VoucherListModal";
import { useCart } from "@/lib/cart-context";
import { formatVND, type Voucher } from "@/lib/data";
import { getProvinces, getWardsByProvince } from "@/lib/address";

const PAYMENT_METHODS = [
  { key: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { key: "VNPay", label: "VNPay" },
  { key: "MoMo", label: "Ví MoMo" },
];

// Phương thức thanh toán đang được ẩn khỏi giao diện theo yêu cầu — đơn hàng
// vẫn luôn gửi đi với phương thức mặc định "COD". Đổi thành true để hiện lại.
const SHOW_PAYMENT_METHODS = false;

const BASE_SHIPPING_FEE = 25000;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [ward, setWard] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [voucherInput, setVoucherInput] = useState("");
  // Tối đa 2 mã cùng lúc: 1 mã giảm giá (percent/fixed) + 1 mã miễn phí vận chuyển,
  // trừ khi có điều kiện loại trừ (độc quyền / không đi kèm freeship) — xem lib/vouchers.ts
  const [appliedVouchers, setAppliedVouchers] = useState<Voucher[]>([]);
  const [voucherError, setVoucherError] = useState("");
  const [voucherChecking, setVoucherChecking] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const provinces = useMemo(() => getProvinces(), []);
  const wards = useMemo(
    () => (province ? getWardsByProvince(province) : []),
    [province]
  );

  const appliedCodes = appliedVouchers.map((v) => v.code);

  const shippingFee = useMemo(() => {
    if (appliedVouchers.some((v) => v.type === "freeship")) return 0;
    return items.length > 0 ? BASE_SHIPPING_FEE : 0;
  }, [appliedVouchers, items.length]);

  const discount = useMemo(() => {
    const discountVoucher = appliedVouchers.find((v) => v.type !== "freeship");
    if (!discountVoucher) return 0;
    if (discountVoucher.type === "percent") {
      return Math.round((subtotal * discountVoucher.value) / 100);
    }
    return Math.min(discountVoucher.value, subtotal);
  }, [appliedVouchers, subtotal]);

  const total = Math.max(0, subtotal - discount + shippingFee);

  const applyVoucherCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    setVoucherChecking(true);
    setVoucherError("");
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal, appliedCodes }),
      });
      const data = await res.json();
      if (!data.ok) {
        setVoucherError(data.error ?? "Mã giảm giá không hợp lệ.");
      } else {
        setAppliedVouchers((prev) => [...prev, data.voucher]);
        setVoucherError("");
        setVoucherInput("");
      }
    } catch {
      setVoucherError("Không kiểm tra được mã giảm giá, vui lòng thử lại.");
    }
    setVoucherChecking(false);
  };

  const handleApplyVoucher = () => applyVoucherCode(voucherInput);

  const removeVoucher = (code: string) => {
    setAppliedVouchers((prev) => prev.filter((v) => v.code !== code));
    setVoucherError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (items.length === 0) {
      setFormError("Giỏ hàng của bạn đang trống.");
      return;
    }
    if (!fullName || !phone || !address || !province || !ward) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          address,
          province,
          ward,
          note,
          paymentMethod,
          voucherCode: appliedCodes.join(" + "),
          shippingFee,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Đặt hàng thất bại, vui lòng thử lại.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/dat-hang-thanh-cong?orderId=${data.orderId}`);
    } catch {
      setFormError("Không thể kết nối máy chủ. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="pt-24 pb-20 px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-3xl text-ink mb-10 text-center">
            Thanh toán
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-10"
          >
            {/* customer info */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl text-ink mb-4">
                  Thông tin khách hàng
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Họ tên *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border border-blush rounded-soft px-4 py-3 text-sm focus:outline-none focus:border-clay sm:col-span-2"
                  />
                  <input
                    required
                    placeholder="Số điện thoại *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-blush rounded-soft px-4 py-3 text-sm focus:outline-none focus:border-clay"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-blush rounded-soft px-4 py-3 text-sm focus:outline-none focus:border-clay"
                  />
                  <input
                    required
                    placeholder="Địa chỉ (số nhà, đường) *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border border-blush rounded-soft px-4 py-3 text-sm focus:outline-none focus:border-clay sm:col-span-2"
                  />
                  <select
                    required
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setWard("");
                    }}
                    className="border border-blush rounded-soft px-4 py-3 text-sm focus:outline-none focus:border-clay bg-white"
                  >
                    <option value="">Tỉnh/Thành phố *</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={ward}
                    disabled={!province}
                    onChange={(e) => setWard(e.target.value)}
                    className="border border-blush rounded-soft px-4 py-3 text-sm focus:outline-none focus:border-clay bg-white disabled:opacity-50"
                  >
                    <option value="">
                      {province ? "Phường/Xã *" : "Chọn Tỉnh/Thành phố trước"}
                    </option>
                    {wards.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Ghi chú (tuỳ chọn)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="border border-blush rounded-soft px-4 py-3 text-sm focus:outline-none focus:border-clay sm:col-span-2"
                  />
                </div>
              </div>

              {SHOW_PAYMENT_METHODS && (
                <div>
                  <h2 className="font-display text-xl text-ink mb-4">
                    Phương thức thanh toán
                  </h2>
                  <div className="space-y-2.5">
                    {PAYMENT_METHODS.map((m) => (
                      <label
                        key={m.key}
                        className={`flex items-center gap-3 border rounded-soft px-4 py-3 text-sm cursor-pointer transition-colors ${
                          paymentMethod === m.key
                            ? "border-clay bg-sand/60"
                            : "border-blush"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === m.key}
                          onChange={() => setPaymentMethod(m.key)}
                          className="accent-clayDark"
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* order summary */}
            <div className="bg-sand/50 rounded-softLg p-6 h-fit space-y-5">
              <h2 className="font-display text-xl text-ink">Đơn hàng của bạn</h2>

              {items.length === 0 ? (
                <p className="text-sm text-inkLight">Giỏ hàng đang trống.</p>
              ) : (
                <ul className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <div className="relative h-14 w-14 rounded-soft overflow-hidden bg-white shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink line-clamp-1">{item.name}</p>
                        <p className="text-xs text-inkLight">SL: {item.quantity}</p>
                      </div>
                      <span className="font-price text-sm font-semibold text-ink shrink-0">
                        {formatVND(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* voucher input + picker */}
              <div className="flex gap-2">
                <input
                  placeholder="Nhập mã giảm giá"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  className="flex-1 border border-blush rounded-soft px-3 py-2.5 text-sm focus:outline-none focus:border-clay bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={voucherChecking || !voucherInput.trim()}
                  className="px-4 text-xs rounded-soft border border-clay text-clayDark hover:bg-clay hover:text-white transition-colors disabled:opacity-50"
                >
                  {voucherChecking ? "Đang kiểm tra..." : "Áp dụng"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1.5 text-xs text-clayDark hover:underline -mt-3"
              >
                <Ticket size={13} /> Xem tất cả mã giảm giá
              </button>

              {voucherError && (
                <p className="text-xs text-red-500">{voucherError}</p>
              )}

              {appliedVouchers.length > 0 && (
                <div className="space-y-2">
                  {appliedVouchers.map((v) => (
                    <div
                      key={v.code}
                      className="flex items-center justify-between bg-white border border-clay rounded-soft px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-clayDark">{v.code}</p>
                        <p className="text-[11px] text-inkLight line-clamp-1">
                          {v.label}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVoucher(v.code)}
                        aria-label="Bỏ áp dụng mã"
                        className="text-inkLight hover:text-red-500 shrink-0 ml-2"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-blush pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-inkLight">
                  <span>Tạm tính</span>
                  <span className="font-price font-semibold text-ink">{formatVND(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-clayDark">
                    <span>Giảm giá</span>
                    <span className="font-price font-semibold">-{formatVND(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-inkLight">
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-ink">Miễn phí</span>
                  ) : (
                    <span className="font-price font-semibold text-ink">{formatVND(shippingFee)}</span>
                  )}
                </div>
                <div className="flex justify-between font-display text-lg text-ink pt-2 border-t border-blush">
                  <span>Tổng cộng</span>
                  <span className="font-price text-lg font-extrabold">{formatVND(total)}</span>
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-500">{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full py-3.5 bg-ink text-white text-sm tracking-wide rounded-soft hover:bg-clayDark transition-colors duration-300 disabled:opacity-50"
              >
                {submitting ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />

      {pickerOpen && (
        <VoucherListModal
          subtotal={subtotal}
          appliedCodes={appliedCodes}
          onClose={() => setPickerOpen(false)}
          onSelect={(code) => {
            setPickerOpen(false);
            applyVoucherCode(code);
          }}
        />
      )}
    </main>
  );
}
