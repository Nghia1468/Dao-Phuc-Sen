"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SheetVoucher } from "@/lib/googleSheets";

export type VoucherFormValues = Omit<SheetVoucher, "rowNumber">;

const emptyForm: VoucherFormValues = {
  code: "",
  type: "percent",
  value: 10,
  minSubtotal: 0,
  label: "",
  active: true,
  expiresAt: "",
  exclusive: false,
  excludesFreeship: false,
};

export default function VoucherForm({
  initial,
  isEditing,
  onClose,
  onSaved,
}: {
  initial?: VoucherFormValues;
  isEditing: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<VoucherFormValues>(initial ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = <K extends keyof VoucherFormValues>(
    key: K,
    value: VoucherFormValues[K]
  ) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!values.code.trim() || !values.label.trim()) {
      setError("Vui lòng điền Mã giảm giá và Mô tả hiển thị.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        isEditing
          ? `/api/admin/vouchers/${values.code}`
          : "/api/admin/vouchers",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra.");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError("Không thể kết nối máy chủ.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-softLg w-full max-w-lg p-6 md:p-8 shadow-lift"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-ink hover:text-clayDark"
          aria-label="Đóng"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <h2 className="font-display text-2xl text-ink mb-6">
          {isEditing ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-inkLight">Mã giảm giá *</label>
            <input
              required
              disabled={isEditing}
              value={values.code}
              onChange={(e) => setField("code", e.target.value.toUpperCase())}
              placeholder="vd: SALE20"
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay disabled:bg-sand"
            />
          </div>

          <div>
            <label className="text-xs text-inkLight">Loại giảm giá *</label>
            <select
              value={values.type}
              onChange={(e) =>
                setField("type", e.target.value as VoucherFormValues["type"])
              }
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay bg-white"
            >
              <option value="percent">Giảm theo % </option>
              <option value="fixed">Giảm số tiền cố định</option>
              <option value="freeship">Miễn phí vận chuyển</option>
            </select>
          </div>

          {values.type !== "freeship" && (
            <div>
              <label className="text-xs text-inkLight">
                {values.type === "percent" ? "Phần trăm giảm (%)" : "Số tiền giảm (đ)"} *
              </label>
              <input
                required
                type="number"
                min={0}
                placeholder={values.type === "percent" ? "VD: 10" : "VD: 50000"}
                value={values.value || ""}
                onChange={(e) => setField("value", Number(e.target.value))}
                className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-inkLight">
              Đơn tối thiểu để áp dụng (đ) — 0 nếu không giới hạn
            </label>
            <input
              type="number"
              min={0}
              placeholder="VD: 300000"
              value={values.minSubtotal || ""}
              onChange={(e) => setField("minSubtotal", Number(e.target.value))}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="text-xs text-inkLight">
              Mô tả hiển thị (ở khu vực mã giảm giá trang chủ) *
            </label>
            <input
              required
              value={values.label}
              onChange={(e) => setField("label", e.target.value)}
              placeholder="vd: Giảm 20% cho đơn từ 400.000₫"
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="text-xs text-inkLight">
              Ngày hết hạn (để trống nếu không giới hạn)
            </label>
            <input
              type="date"
              value={values.expiresAt ?? ""}
              onChange={(e) => setField("expiresAt", e.target.value)}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(e) => setField("active", e.target.checked)}
              className="accent-clayDark"
            />
            Đang kích hoạt (khách có thể áp dụng)
          </label>

          <div className="border-t border-blush pt-4 space-y-3">
            <p className="text-xs text-inkLight">Điều kiện kết hợp (nâng cao)</p>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.exclusive}
                onChange={(e) => setField("exclusive", e.target.checked)}
                className="accent-clayDark"
              />
              Mã độc quyền — không dùng chung được với bất kỳ mã nào khác
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.excludesFreeship}
                onChange={(e) => setField("excludesFreeship", e.target.checked)}
                className="accent-clayDark"
              />
              Không đi kèm được với mã miễn phí vận chuyển (áp dụng 2 chiều)
            </label>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-ink text-white text-sm tracking-wide rounded-soft hover:bg-clayDark transition-colors duration-300 disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm mã"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-blush text-ink text-sm rounded-soft hover:border-clay transition-colors"
          >
            Huỷ
          </button>
        </div>
      </form>
    </div>
  );
}
