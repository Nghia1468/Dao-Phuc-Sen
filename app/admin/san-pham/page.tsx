"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { formatVND } from "@/lib/data";
import type { SheetProduct } from "@/lib/googleSheets";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<SheetProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductFormValues | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tải được danh sách sản phẩm.");
        setProducts([]);
      } else {
        setProducts(data.products);
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
    if (!confirm(`Xóa sản phẩm "${id}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
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

  const openEdit = (p: SheetProduct) => {
    const { rowNumber, ...rest } = p;
    void rowNumber;
    setEditing(rest);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Quản lý sản phẩm</h1>
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
            <Plus size={15} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-white border border-red-200 text-red-600 text-sm rounded-soft p-4 mb-6">
          {error}
        </div>
      )}

        {loading ? (
          <p className="text-sm text-inkLight">Đang tải...</p>
        ) : products.length === 0 && !error ? (
          <p className="text-sm text-inkLight">Chưa có sản phẩm nào trong Sheet.</p>
        ) : (
          <div className="bg-white rounded-softLg overflow-hidden shadow-whisper">
            <table className="w-full text-sm">
              <thead className="bg-sand/60 text-inkLight text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Ảnh</th>
                  <th className="text-left px-4 py-3">Tên sản phẩm</th>
                  <th className="text-left px-4 py-3">Danh mục</th>
                  <th className="text-left px-4 py-3">Giá</th>
                  <th className="text-left px-4 py-3">Kho</th>
                  <th className="text-left px-4 py-3">Nhãn</th>
                  <th className="text-right px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-blush/60">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 rounded-soft overflow-hidden bg-sand">
                        {p.images[0] && (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink line-clamp-1">{p.name}</p>
                      <p className="text-xs text-inkLight">{p.id}</p>
                    </td>
                    <td className="px-4 py-3 text-inkLight">{p.category}</td>
                    <td className="px-4 py-3">
                      {p.salePrice ? (
                        <>
                          <span className="text-clayDark">{formatVND(p.salePrice)}</span>
                          <span className="block text-xs text-inkLight line-through">
                            {formatVND(p.price)}
                          </span>
                        </>
                      ) : (
                        formatVND(p.price)
                      )}
                    </td>
                    <td className="px-4 py-3 text-inkLight">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isSale && (
                          <span className="text-[10px] bg-clayDark text-white px-2 py-0.5 rounded-full">
                            Sale
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="text-[10px] bg-ink text-white px-2 py-0.5 rounded-full">
                            Best
                          </span>
                        )}
                        {p.isNew && (
                          <span className="text-[10px] bg-blush text-clayDark px-2 py-0.5 rounded-full">
                            Mới
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          aria-label="Sửa"
                          className="text-ink hover:text-clayDark"
                        >
                          <Pencil size={15} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          aria-label="Xóa"
                          className="text-ink hover:text-red-500 disabled:opacity-40"
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {formOpen && (
        <ProductForm
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
