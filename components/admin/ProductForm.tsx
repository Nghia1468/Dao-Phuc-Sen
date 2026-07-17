"use client";

import { useState } from "react";
import { X, Film, Youtube, Upload, Pin } from "lucide-react";
import { categories } from "@/lib/data";
import type { SheetProduct } from "@/lib/googleSheets";
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/youtube";

export type ProductFormValues = Omit<SheetProduct, "rowNumber">;

const emptyForm: ProductFormValues = {
  id: "",
  name: "",
  slug: "",
  category: categories[0]?.name ?? "",
  price: 0,
  salePrice: undefined,
  shortDescription: "",
  description: "",
  images: ["", "", "", "", ""],
  stock: 0,
  isSale: false,
  isBestSeller: false,
  isNew: false,
  isVisible: true,
  isFeatured: false,
  colors: [],
  sizes: [],
  rating: undefined,
  sold: undefined,
  reviewCount: undefined,
  specs: {},
  variants: [],
  video: "",
  isPinned: false,
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductForm({
  initial,
  isEditing,
  onClose,
  onSaved,
}: {
  initial?: ProductFormValues;
  isEditing: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<ProductFormValues>(
    initial
      ? { ...initial, images: [...initial.images, "", "", "", "", ""].slice(0, 5) }
      : emptyForm
  );
  const [colorsInput, setColorsInput] = useState(
    (initial?.colors ?? []).join(", ")
  );
  const [sizesInput, setSizesInput] = useState((initial?.sizes ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [videoMode, setVideoMode] = useState<"link" | "upload">(
    initial?.video && !isYouTubeUrl(initial.video) ? "upload" : "link"
  );
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState("");

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) => setValues((v) => ({ ...v, [key]: value }));

  const setImage = (index: number, url: string) => {
    setValues((v) => {
      const images = [...v.images];
      images[index] = url;
      return { ...v, images };
    });
  };

  const handleUpload = async (index: number, file?: File) => {
    if (!file) return;
    setUploadError("");
    setUploadingIndex(index);
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
        setUploadError(data.error ?? "Tải ảnh lên thất bại.");
      } else {
        setImage(index, data.url);
      }
    } catch {
      setUploadError("Tải ảnh lên thất bại.");
    }
    setUploadingIndex(null);
  };

  const handleVideoFileUpload = async (file?: File) => {
    if (!file) return;
    setVideoError("");
    setUploadingVideo(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Không đọc được file video."));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, type: "video" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVideoError(data.error ?? "Tải video lên thất bại.");
      } else {
        setField("video", data.url);
      }
    } catch {
      setVideoError("Tải video lên thất bại.");
    }
    setUploadingVideo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!values.id.trim() || !values.name.trim() || !values.category.trim()) {
      setError("Vui lòng điền ID, Tên sản phẩm và Danh mục.");
      return;
    }

    const payload: ProductFormValues = {
      ...values,
      slug: values.slug.trim() || slugify(values.name),
      images: values.images.filter((s) => s.trim() !== ""),
      colors: colorsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      sizes: sizesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      variants: (values.variants ?? []).filter((v) => v.label.trim() !== "" && v.price > 0),
      video: values.video?.trim() || undefined,
    };

    setSaving(true);
    try {
      const res = await fetch(
        isEditing ? `/api/admin/products/${values.id}` : "/api/admin/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
        className="relative bg-white rounded-softLg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-lift"
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
          {isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-inkLight">ID (duy nhất) *</label>
            <input
              required
              disabled={isEditing}
              value={values.id}
              onChange={(e) => setField("id", e.target.value)}
              placeholder="vd: dao-chat-ga-2"
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay disabled:bg-sand"
            />
          </div>
          <div>
            <label className="text-xs text-inkLight">Danh mục *</label>
            <select
              required
              value={values.category}
              onChange={(e) => setField("category", e.target.value)}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-inkLight">Tên sản phẩm *</label>
            <input
              required
              value={values.name}
              onChange={(e) => {
                const name = e.target.value;
                setValues((v) => ({
                  ...v,
                  name,
                  slug: v.slug && v.slug !== slugify(v.name) ? v.slug : slugify(name),
                }));
              }}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-inkLight">Slug (đường dẫn URL) *</label>
            <input
              required
              value={values.slug}
              onChange={(e) => setField("slug", slugify(e.target.value))}
              placeholder="vd: dao-chat-ga-2"
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-inkLight">Mô tả ngắn (hiển thị ở danh sách sản phẩm)</label>
            <input
              value={values.shortDescription ?? ""}
              onChange={(e) => setField("shortDescription", e.target.value)}
              placeholder="VD: Dao chặt gà, vịt rèn thủ công — thép nhíp đỏ Nga, bền sắc."
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="text-xs text-inkLight">Giá (đ) *</label>
            <input
              required
              type="number"
              min={0}
              placeholder="VD: 300000"
              value={values.price || ""}
              onChange={(e) => setField("price", Number(e.target.value))}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>
          <div>
            <label className="text-xs text-inkLight">Giá giảm (đ, để trống nếu không sale)</label>
            <input
              type="number"
              min={0}
              placeholder="VD: 250000"
              value={values.salePrice ?? ""}
              onChange={(e) =>
                setField(
                  "salePrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-inkLight">Mô tả (xuống dòng thế nào sẽ hiển thị đúng như vậy ở trang sản phẩm)</label>
            <textarea
              rows={4}
              placeholder={"VD:\nDao chặt gà rèn thủ công từ thép nhíp đỏ Nga.\nBản rộng, dày dặn, chặt gọn không dập xương.\nCó thể chọn cán sắt hoặc cán gỗ."}
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-inkLight">
              Ảnh sản phẩm — tối đa 5 ảnh (tải lên hoặc dán URL)
            </label>
            <div className="space-y-2 mt-1">
              {values.images.map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt=""
                      className="h-10 w-10 rounded-soft object-cover border border-blush shrink-0"
                    />
                  )}
                  <input
                    value={img}
                    onChange={(e) => setImage(i, e.target.value)}
                    placeholder={`URL ảnh ${i + 1} (hoặc bấm Tải ảnh bên phải)`}
                    className="flex-1 border border-blush rounded-soft px-3 py-2 text-sm focus:outline-none focus:border-clay"
                  />
                  <label className="shrink-0 text-xs px-3 py-2 rounded-soft border border-clay text-clayDark hover:bg-clay hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                    {uploadingIndex === i ? "Đang tải..." : "Tải ảnh"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingIndex !== null}
                      onChange={(e) => handleUpload(i, e.target.files?.[0])}
                    />
                  </label>
                </div>
              ))}
            </div>
            {uploadError && (
              <p className="text-xs text-red-500 mt-1.5">{uploadError}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-inkLight flex items-center gap-1.5">
              <Film size={13} /> Video giới thiệu sản phẩm (không bắt buộc) — chỉ hiển thị ở trang chi tiết sản phẩm
            </label>

            <div className="flex gap-2 mt-2 mb-2">
              <button
                type="button"
                onClick={() => setVideoMode("link")}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  videoMode === "link"
                    ? "bg-ink text-white border-ink"
                    : "border-blush text-inkLight hover:border-clay"
                }`}
              >
                <Youtube size={13} /> Link Youtube
              </button>
              <button
                type="button"
                onClick={() => setVideoMode("upload")}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  videoMode === "upload"
                    ? "bg-ink text-white border-ink"
                    : "border-blush text-inkLight hover:border-clay"
                }`}
              >
                <Upload size={13} /> Tải video lên
              </button>
            </div>

            {videoMode === "link" ? (
              <input
                value={values.video ?? ""}
                onChange={(e) => setField("video", e.target.value)}
                placeholder="VD: https://www.youtube.com/watch?v=..."
                className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm focus:outline-none focus:border-clay"
              />
            ) : (
              <div className="flex items-center gap-3">
                <label className="shrink-0 text-xs px-3 py-2.5 rounded-soft border border-clay text-clayDark hover:bg-clay hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                  {uploadingVideo ? "Đang tải..." : "Chọn file video"}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={uploadingVideo}
                    onChange={(e) => handleVideoFileUpload(e.target.files?.[0])}
                  />
                </label>
                {values.video && !isYouTubeUrl(values.video) && (
                  <span className="text-xs text-inkLight truncate">
                    Đã tải: {values.video.split("/").pop()}
                  </span>
                )}
              </div>
            )}

            {values.video && (
              <div className="mt-2.5 flex items-center gap-3">
                <div className="w-40 aspect-video rounded-soft overflow-hidden bg-black/80 shrink-0">
                  {isYouTubeUrl(values.video) && getYouTubeEmbedUrl(values.video) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(values.video)!}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={values.video} className="w-full h-full object-contain" controls />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setField("video", "")}
                  className="text-xs text-red-500 hover:underline"
                >
                  Xoá video
                </button>
              </div>
            )}
            {videoError && <p className="text-xs text-red-500 mt-1.5">{videoError}</p>}
          </div>

          <div>
            <label className="text-xs text-inkLight">Tồn kho *</label>
            <input
              required
              type="number"
              min={0}
              placeholder="VD: 20"
              value={values.stock || ""}
              onChange={(e) => setField("stock", Number(e.target.value))}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>
          <div>
            <label className="text-xs text-inkLight">Đánh giá (0-5, tuỳ chọn)</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              placeholder="VD: 4.9"
              value={values.rating ?? ""}
              onChange={(e) =>
                setField("rating", e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-inkLight mb-1">Thông số kỹ thuật</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ["steelType", "Loại thép"],
                  ["bladeLength", "Chiều dài lưỡi"],
                  ["bladeWidth", "Bản rộng"],
                  ["handleLength", "Chiều dài cán"],
                  ["thickness", "Độ dày"],
                  ["weight", "Trọng lượng"],
                  ["handleMaterial", "Chất liệu cán"],
                  ["origin", "Xuất xứ"],
                  ["warranty", "Bảo hành"],
                ] as [keyof NonNullable<ProductFormValues["specs"]>, string][]
              ).map(([key, label]) => (
                <input
                  key={key}
                  value={values.specs?.[key] ?? ""}
                  onChange={(e) =>
                    setField("specs", { ...values.specs, [key]: e.target.value })
                  }
                  placeholder={label}
                  className="w-full border border-blush rounded-soft px-3 py-2 text-sm focus:outline-none focus:border-clay"
                />
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-inkLight">
                Tuỳ biến sản phẩm — tự đặt tên (VD: Cán Sắt, Cán Gỗ, Cán Titan...), mỗi loại có giá riêng. Để trống nếu sản phẩm chỉ có 1 phiên bản, ví dụ đá mài
              </p>
              <button
                type="button"
                onClick={() =>
                  setField("variants", [
                    ...(values.variants ?? []),
                    {
                      id: `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
                      label: "",
                      price: values.price || 0,
                      stock: values.stock || 0,
                    },
                  ])
                }
                className="text-xs text-clayDark hover:underline shrink-0"
              >
                + Thêm tuỳ biến
              </button>
            </div>
            <div className="space-y-2">
              {(values.variants ?? []).map((v, i) => (
                <div key={v.id} className="flex flex-wrap items-center gap-2 border border-blush rounded-soft p-2">
                  <input
                    value={v.label}
                    onChange={(e) => {
                      const next = [...(values.variants ?? [])];
                      next[i] = { ...next[i], label: e.target.value };
                      setField("variants", next);
                    }}
                    placeholder="Tên tuỳ biến — VD: Cán Sắt"
                    className="flex-1 min-w-[140px] border border-blush rounded-soft px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Giá"
                    value={v.price || ""}
                    onChange={(e) => {
                      const next = [...(values.variants ?? [])];
                      next[i] = { ...next[i], price: Number(e.target.value) };
                      setField("variants", next);
                    }}
                    className="w-24 border border-blush rounded-soft px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Giá giảm"
                    value={v.salePrice ?? ""}
                    onChange={(e) => {
                      const next = [...(values.variants ?? [])];
                      next[i] = {
                        ...next[i],
                        salePrice: e.target.value ? Number(e.target.value) : undefined,
                      };
                      setField("variants", next);
                    }}
                    className="w-24 border border-blush rounded-soft px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Tồn kho"
                    value={v.stock ?? ""}
                    onChange={(e) => {
                      const next = [...(values.variants ?? [])];
                      next[i] = {
                        ...next[i],
                        stock: e.target.value ? Number(e.target.value) : undefined,
                      };
                      setField("variants", next);
                    }}
                    className="w-24 border border-blush rounded-soft px-2 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setField(
                        "variants",
                        (values.variants ?? []).filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-xs text-red-500 hover:underline ml-auto"
                  >
                    Xoá
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-5 pt-1">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.isSale}
                onChange={(e) => setField("isSale", e.target.checked)}
                className="accent-clayDark"
              />
              Sale
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.isBestSeller}
                onChange={(e) => setField("isBestSeller", e.target.checked)}
                className="accent-clayDark"
              />
              Best Seller
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.isNew}
                onChange={(e) => setField("isNew", e.target.checked)}
                className="accent-clayDark"
              />
              Mới
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(e) => setField("isFeatured", e.target.checked)}
                className="accent-clayDark"
              />
              Nổi bật
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.isPinned ?? false}
                onChange={(e) => setField("isPinned", e.target.checked)}
                className="accent-clayDark"
              />
              <Pin size={13} className="text-clayDark" /> Ghim lên đầu trang
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={values.isVisible}
                onChange={(e) => setField("isVisible", e.target.checked)}
                className="accent-clayDark"
              />
              Hiển thị công khai
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
            {saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm sản phẩm"}
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
