"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { formatVND } from "@/lib/data";
import type { SheetOrder } from "@/lib/googleSheets";

const STATUS_OPTIONS = ["Chờ xác nhận", "Đã gọi", "Đang giao", "Hoàn thành", "Đã hủy"];

const STATUS_COLOR: Record<string, string> = {
  "Chờ xác nhận": "bg-blush text-clayDark",
  "Đã gọi": "bg-sand text-ink",
  "Đang giao": "bg-secondary/20 text-secondary",
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đã hủy": "bg-red-100 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<SheetOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Tất cả");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tải được danh sách đơn hàng.");
        setOrders([]);
      } else {
        setOrders(data.orders);
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (order: SheetOrder, status: string) => {
    setSavingId(order.orderId);
    try {
      await fetch(`/api/admin/orders/${order.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: noteDrafts[order.orderId] ?? order.note }),
      });
      await load();
    } catch {
      alert("Không thể kết nối máy chủ.");
    }
    setSavingId(null);
  };

  const saveNote = async (order: SheetOrder) => {
    setSavingId(order.orderId);
    try {
      await fetch(`/api/admin/orders/${order.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: order.status, note: noteDrafts[order.orderId] ?? order.note }),
      });
      await load();
    } catch {
      alert("Không thể kết nối máy chủ.");
    }
    setSavingId(null);
  };

  const filtered =
    filter === "Tất cả" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Quản lý đơn hàng</h1>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-ink hover:text-clayDark transition-colors"
        >
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["Tất cả", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs border transition-colors ${
              filter === s
                ? "bg-ink text-white border-ink"
                : "border-blush text-ink hover:border-clay"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-white border border-red-200 text-red-600 text-sm rounded-soft p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkLight">Đang tải...</p>
      ) : filtered.length === 0 && !error ? (
        <p className="text-sm text-inkLight">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.orderId} className="bg-white rounded-softLg shadow-whisper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium text-ink">{o.orderId}</p>
                  <p className="text-xs text-inkLight">{o.orderedAt}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full shrink-0 ${
                    STATUS_COLOR[o.status] ?? "bg-sand text-ink"
                  }`}
                >
                  {o.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-inkLight text-xs mb-0.5">Khách hàng</p>
                  <p className="text-ink">{o.fullName} · {o.phone}</p>
                  <p className="text-inkLight text-xs mt-0.5">
                    {o.address}{o.ward ? `, ${o.ward}` : ""}{o.province ? `, ${o.province}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-inkLight text-xs mb-0.5">Sản phẩm</p>
                  <p className="text-ink">{o.productsSummary}</p>
                  <p className="text-inkLight text-xs mt-0.5">
                    {o.quantity} sản phẩm · {o.paymentMethod}
                    {o.voucherCode ? ` · Mã: ${o.voucherCode}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blush/60 pt-3">
                <p className="font-display text-lg text-clayDark">{formatVND(o.total)}</p>
                <select
                  value={o.status}
                  disabled={savingId === o.orderId}
                  onChange={(e) => updateStatus(o, e.target.value)}
                  className="border border-blush rounded-soft px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-clay"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input
                  value={noteDrafts[o.orderId] ?? o.note}
                  onChange={(e) =>
                    setNoteDrafts((d) => ({ ...d, [o.orderId]: e.target.value }))
                  }
                  placeholder="Ghi chú nội bộ..."
                  className="flex-1 border border-blush rounded-soft px-3 py-1.5 text-xs focus:outline-none focus:border-clay"
                />
                <button
                  onClick={() => saveNote(o)}
                  disabled={savingId === o.orderId}
                  className="text-xs px-3 py-1.5 rounded-soft border border-clay text-clayDark hover:bg-clay hover:text-white transition-colors disabled:opacity-50"
                >
                  Lưu ghi chú
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
