"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, RefreshCw, Star } from "lucide-react";
import type { SheetBanner } from "@/lib/googleSheets";
import BannerForm, { type BannerFormValues } from "@/components/admin/BannerForm";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<SheetBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BannerFormValues | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tải được danh sách banner.");
        setBanners([]);
      } else {
        setBanners(data.banners);
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(`Xóa banner "${id}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Xóa thất bại.");
      } else {
        await load();
      }
    } catch {
      alert("Không thể kết nối máy chủ.");
    }
    setDeletingId(null);
  };

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (b: SheetBanner) => {
    const { rowNumber, ...rest } = b;
    void rowNumber;
    setEditing(rest);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Quản lý banner</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-ink hover:text-clayDark transition-colors"
          >
            <RefreshCw size={14} /> Tải lại
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-ink text-white text-sm rounded-soft hover:bg-clayDark transition-colors"
          >
            <Plus size={15} /> Thêm banner
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-white border border-red-200 text-red-600 text-sm rounded-soft p-4 mb-6">
          {error}
          {error.includes("Google Sheets") && (
            <p className="mt-1 text-xs text-inkLight">
              Trong lúc chưa cấu hình Sheets, trang chủ vẫn hiển thị banner mẫu có sẵn trong code (lib/data.ts).
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkLight">Đang tải...</p>
      ) : banners.length === 0 && !error ? (
        <p className="text-sm text-inkLight">Chưa có banner nào trong Sheet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-softLg shadow-whisper overflow-hidden">
              <div className="relative h-32 bg-sand">
                {b.image && (
                  <Image src={b.image} alt={b.title} fill sizes="400px" className="object-cover" />
                )}
                {b.isMain && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] bg-clayDark text-white px-2 py-0.5 rounded-full">
                    <Star size={10} /> Banner chính
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-ink font-medium line-clamp-1">{b.title}</p>
                <p className="text-xs text-inkLight line-clamp-2 mt-1">{b.subtitle}</p>
                <div className="flex items-center justify-end gap-3 mt-3">
                  <button
                    onClick={() => openEdit(b)}
                    aria-label="Sửa"
                    className="text-ink hover:text-clayDark"
                  >
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    aria-label="Xóa"
                    className="text-ink hover:text-red-500 disabled:opacity-40"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <BannerForm
          initial={editing}
          isEditing={!!editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
