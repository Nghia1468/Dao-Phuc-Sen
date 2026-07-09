"use client";

import { useRef, useState } from "react";
import { X, ImagePlus } from "lucide-react";
import type { SheetPost } from "@/lib/googleSheets";

export type PostFormValues = Omit<SheetPost, "rowNumber">;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const emptyForm: PostFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "Dao Phúc Sen",
  publishedAt: new Date().toISOString().slice(0, 10),
  status: "Draft",
};

export default function PostForm({
  initial,
  isEditing,
  onClose,
  onSaved,
}: {
  initial?: PostFormValues;
  isEditing: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<PostFormValues>(initial ?? emptyForm);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const setField = <K extends keyof PostFormValues>(
    key: K,
    value: PostFormValues[K]
  ) => setValues((v) => ({ ...v, [key]: value }));

  const handleTitleChange = (title: string) => {
    setField("title", title);
    if (!slugTouched) setField("slug", slugify(title));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
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
    if (!res.ok) throw new Error(data.error ?? "Tải ảnh lên thất bại.");
    return data.url as string;
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file) return;
    setUploadingCover(true);
    setError("");
    try {
      const url = await uploadToCloudinary(file);
      setField("coverImage", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh bìa thất bại.");
    }
    setUploadingCover(false);
  };

  /** Chèn ảnh vào đúng vị trí con trỏ trong ô nội dung (Markdown). */
  const handleInsertImage = async (file?: File) => {
    if (!file) return;
    setUploadingInline(true);
    setError("");
    try {
      const url = await uploadToCloudinary(file);
      const textarea = contentRef.current;
      const markdown = `\n![mô tả ảnh](${url})\n`;
      if (textarea) {
        const start = textarea.selectionStart ?? values.content.length;
        const end = textarea.selectionEnd ?? values.content.length;
        const next = values.content.slice(0, start) + markdown + values.content.slice(end);
        setField("content", next);
      } else {
        setField("content", values.content + markdown);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chèn ảnh thất bại.");
    }
    setUploadingInline(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.slug.trim() || !values.title.trim()) {
      setError("Vui lòng điền Slug và Tiêu đề.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        isEditing ? `/api/admin/posts/${values.slug}` : "/api/admin/posts",
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
        className="relative bg-white rounded-softLg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-lift"
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
          {isEditing ? "Sửa bài viết" : "Viết bài mới"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-inkLight">Tiêu đề *</label>
            <input
              required
              value={values.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="VD: Cách chọn vòng cổ phù hợp"
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="text-xs text-inkLight">
              Slug (đường dẫn URL) *
            </label>
            <input
              required
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", slugify(e.target.value));
              }}
              disabled={isEditing}
              placeholder="vd: cach-chon-vong-co-phu-hop"
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay disabled:bg-sand"
            />
            <p className="text-xs text-inkLight mt-1">
              URL sẽ là: /blog/{values.slug || "..."}
            </p>
          </div>

          <div>
            <label className="text-xs text-inkLight">Mô tả ngắn (hiển thị ở danh sách blog & SEO)</label>
            <textarea
              rows={2}
              value={values.excerpt}
              onChange={(e) => setField("excerpt", e.target.value)}
              placeholder="Tóm tắt 1-2 câu nội dung bài viết..."
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
            />
          </div>

          <div>
            <label className="text-xs text-inkLight">Ảnh bìa</label>
            <div className="flex items-center gap-3 mt-1">
              {values.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values.coverImage}
                  alt=""
                  className="h-16 w-16 rounded-soft object-cover border border-blush"
                />
              )}
              <input
                value={values.coverImage}
                onChange={(e) => setField("coverImage", e.target.value)}
                placeholder="URL ảnh bìa (hoặc tải lên)"
                className="flex-1 border border-blush rounded-soft px-3 py-2.5 text-sm focus:outline-none focus:border-clay"
              />
              <label className="shrink-0 text-xs px-3 py-2.5 rounded-soft border border-clay text-clayDark hover:bg-clay hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                {uploadingCover ? "Đang tải..." : "Tải ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingCover}
                  onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-inkLight">
                Nội dung (Markdown — ## Tiêu đề phụ, **đậm**, danh sách...)
              </label>
              <label className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-soft border border-clay text-clayDark hover:bg-clay hover:text-white transition-colors cursor-pointer">
                <ImagePlus size={13} />
                {uploadingInline ? "Đang chèn..." : "Chèn ảnh vào nội dung"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingInline}
                  onChange={(e) => handleInsertImage(e.target.files?.[0])}
                />
              </label>
            </div>
            <textarea
              ref={contentRef}
              rows={12}
              value={values.content}
              onChange={(e) => setField("content", e.target.value)}
              placeholder={"## Xác định dáng cổ áo\n\nCổ áo tròn hợp với vòng cổ dài...\n\n## Chọn theo dáng mặt\n\n..."}
              className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-clay"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-inkLight">Tác giả</label>
              <input
                value={values.author}
                onChange={(e) => setField("author", e.target.value)}
                className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="text-xs text-inkLight">Ngày đăng</label>
              <input
                type="date"
                value={values.publishedAt}
                onChange={(e) => setField("publishedAt", e.target.value)}
                className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="text-xs text-inkLight">Trạng thái</label>
              <select
                value={values.status}
                onChange={(e) => setField("status", e.target.value as PostFormValues["status"])}
                className="w-full border border-blush rounded-soft px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-clay bg-white"
              >
                <option value="Draft">Nháp</option>
                <option value="Published">Đã xuất bản</option>
              </select>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-ink text-white text-sm tracking-wide rounded-soft hover:bg-clayDark transition-colors duration-300 disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Đăng bài"}
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
