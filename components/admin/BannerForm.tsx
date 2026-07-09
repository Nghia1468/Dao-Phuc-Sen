"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SheetBanner } from "@/lib/googleSheets";

export type BannerFormValues = Omit<SheetBanner, "rowNumber">;

const emptyForm: BannerFormValues = {
  id: "",
  title: "",
  subtitle: "",
  image: "",
  primaryCta: "Mua ngay",
  secondaryCta: "Thêm vào giỏ hàng",
  isMain: false,
};

export default function BannerForm({
  initial,
  isEditing,
  onClose,
  onSaved,
}: {
  initial?: BannerFormValues;
  isEditing: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<BannerFormValues>(initial ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const setField = <K extends keyof BannerFormValues>(key: K, value: BannerFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Không đọc được file ảnh."));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Tải ảnh lên thất bại.");
      } else {
        setField("image", data.url);
      }
    } catch {
      setError("Tải ảnh lên thất bại.");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.id.trim() || !values.title.trim() || !values.image.trim()) {
      setError("Vui lòng điền ID, Tiêu đề và Ảnh banner.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        isEditing ? `/api/admin/banners/${values.id}` : "/api/admin/banners",
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
        className="relative bg-white rounded-softLg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-lift"
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
          {isEditing ? "Sửa banner" : "Thêm banner"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-inkLight">ID (duy nhất) *</label>
            <input
              required
              disabled={isEditing}
              value={values.id}
              onChange={(e) => setField("id", e.target.value)}
              placeholder="vd: b5"
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay disabled:bg-sand"
            />
          </div>
          <div>
            <label className="text-xs text-inkLight">Tiêu đề *</label>
            <input
              required
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>
          <div>
            <label className="text-xs text-inkLight">Mô tả phụ</label>
            <input
              value={values.subtitle}
              onChange={(e) => setField("subtitle", e.target.value)}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="text-xs text-inkLight">Ảnh banner *</label>
            <div className="flex items-center gap-2 mt-1">
              {values.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values.image}
                  alt=""
                  className="h-12 w-16 rounded-soft object-cover border border-blush shrink-0"
                />
              )}
              <input
                value={values.image}
                onChange={(e) => setField("image", e.target.value)}
                placeholder="URL ảnh (hoặc bấm Tải ảnh)"
                className="flex-1 border border-blush rounded-soft px-3 py-2 text-sm focus:outline-none focus:border-clay"
              />
              <label className="shrink-0 text-xs px-3 py-2 rounded-soft border border-clay text-clayDark hover:bg-clay hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                {uploading ? "Đang tải..." : "Tải ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-inkLight">Nút chính</label>
              <input
                value={values.primaryCta}
                onChange={(e) => setField("primaryCta", e.target.value)}
                className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="text-xs text-inkLight">Nút phụ</label>
              <input
                value={values.secondaryCta}
                onChange={(e) => setField("secondaryCta", e.target.value)}
                className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.isMain}
              onChange={(e) => setField("isMain", e.target.checked)}
              className="accent-clayDark"
            />
            Đặt làm banner chính (hiển thị đầu tiên trên trang chủ)
          </label>
        </div>

        {error && <p className="text-xs text-red-500 mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-ink text-white text-sm tracking-wide rounded-soft hover:bg-clayDark transition-colors duration-300 disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm banner"}
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
