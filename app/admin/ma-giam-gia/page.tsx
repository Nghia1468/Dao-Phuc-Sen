"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import type { SheetVoucher } from "@/lib/googleSheets";
import VoucherForm, { type VoucherFormValues } from "@/components/admin/VoucherForm";

const TYPE_LABEL: Record<string, string> = {
  percent: "Giảm %",
  fixed: "Giảm tiền",
  freeship: "Miễn phí ship",
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<SheetVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VoucherFormValues | undefined>(undefined);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vouchers");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tải được danh sách mã giảm giá.");
        setVouchers([]);
      } else {
        setVouchers(data.vouchers);
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (code: string) => {
    if (!confirm(`Xóa mã giảm giá "${code}"?`)) return;
    setDeletingCode(code);
    try {
      const res = await fetch(`/api/admin/vouchers/${code}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Xóa thất bại.");
      } else {
        await load();
      }
    } catch {
      alert("Không thể kết nối máy chủ.");
    }
    setDeletingCode(null);
  };

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (v: SheetVoucher) => {
    const { rowNumber, ...rest } = v;
    void rowNumber;
    setEditing(rest);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Quản lý mã giảm giá</h1>
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
            <Plus size={15} /> Thêm mã
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
      ) : vouchers.length === 0 && !error ? (
        <p className="text-sm text-inkLight">Chưa có mã giảm giá nào trong Sheet.</p>
      ) : (
        <div className="bg-white rounded-softLg overflow-hidden shadow-whisper">
          <table className="w-full text-sm">
            <thead className="bg-sand/60 text-inkLight text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Mã</th>
                <th className="text-left px-4 py-3">Loại</th>
                <th className="text-left px-4 py-3">Giá trị</th>
                <th className="text-left px-4 py-3">Đơn tối thiểu</th>
                <th className="text-left px-4 py-3">Mô tả</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="text-right px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.code} className="border-t border-blush/60">
                  <td className="px-4 py-3 font-medium text-ink">{v.code}</td>
                  <td className="px-4 py-3 text-inkLight">{TYPE_LABEL[v.type]}</td>
                  <td className="px-4 py-3 text-inkLight">
                    {v.type === "freeship"
                      ? "—"
                      : v.type === "percent"
                      ? `${v.value}%`
                      : `${v.value.toLocaleString("vi-VN")}₫`}
                  </td>
                  <td className="px-4 py-3 text-inkLight">
                    {v.minSubtotal > 0
                      ? `${v.minSubtotal.toLocaleString("vi-VN")}₫`
                      : "Không giới hạn"}
                  </td>
                  <td className="px-4 py-3 text-inkLight max-w-xs">
                    <p className="truncate">{v.label}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {v.exclusive && (
                        <span className="text-[10px] bg-ink text-white px-2 py-0.5 rounded-full">
                          Độc quyền
                        </span>
                      )}
                      {v.excludesFreeship && (
                        <span className="text-[10px] bg-blush text-clayDark px-2 py-0.5 rounded-full">
                          Không kèm freeship
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        v.active
                          ? "bg-blush text-clayDark"
                          : "bg-sand text-inkLight"
                      }`}
                    >
                      {v.active ? "Đang bật" : "Đã tắt"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(v)}
                        aria-label="Sửa"
                        className="text-ink hover:text-clayDark"
                      >
                        <Pencil size={15} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.code)}
                        disabled={deletingCode === v.code}
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
        <VoucherForm
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
