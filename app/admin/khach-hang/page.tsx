"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, User } from "lucide-react";
import { formatVND } from "@/lib/data";
import type { SheetOrder } from "@/lib/googleSheets";

interface CustomerSummary {
  phone: string;
  fullName: string;
  address: string;
  orders: SheetOrder[];
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<SheetOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tải được dữ liệu khách hàng.");
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

  // Gom nhóm đơn hàng theo SĐT — đây chính là danh sách "Khách hàng", vì Dao Phúc
  // Sen không cần tài khoản đăng nhập riêng cho khách mua hàng lẻ (chỉ Admin).
  const customers: CustomerSummary[] = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    for (const o of orders) {
      const key = o.phone || o.fullName;
      if (!map.has(key)) {
        map.set(key, {
          phone: o.phone,
          fullName: o.fullName,
          address: o.address,
          orders: [],
          totalSpent: 0,
        });
      }
      const c = map.get(key)!;
      c.orders.push(o);
      if (o.status !== "Đã hủy") c.totalSpent += o.total;
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.fullName.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Khách hàng</h1>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-ink hover:text-clayDark transition-colors"
        >
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm theo tên hoặc số điện thoại..."
        className="w-full sm:w-80 border border-blush rounded-soft px-3 py-2.5 text-sm mb-6 focus:outline-none focus:border-clay"
      />

      {error && (
        <div className="bg-white border border-red-200 text-red-600 text-sm rounded-soft p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkLight">Đang tải...</p>
      ) : filtered.length === 0 && !error ? (
        <p className="text-sm text-inkLight">Chưa có khách hàng nào.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.phone || c.fullName} className="bg-white rounded-softLg shadow-whisper p-5">
              <button
                onClick={() =>
                  setExpanded(expanded === c.phone ? null : c.phone)
                }
                className="w-full flex flex-wrap items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blush flex items-center justify-center shrink-0">
                    <User size={16} className="text-clayDark" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-ink font-medium">{c.fullName}</p>
                    <p className="text-xs text-inkLight">{c.phone} · {c.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-clayDark font-price font-extrabold">{formatVND(c.totalSpent)}</p>
                  <p className="text-xs text-inkLight">{c.orders.length} đơn hàng</p>
                </div>
              </button>

              {expanded === c.phone && (
                <ul className="mt-4 pt-4 border-t border-blush/60 space-y-2">
                  {c.orders.map((o) => (
                    <li key={o.orderId} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-ink">{o.orderId} · {o.status}</p>
                        <p className="text-xs text-inkLight line-clamp-1">{o.productsSummary}</p>
                      </div>
                      <span className="font-price font-semibold text-inkLight text-xs shrink-0 ml-3">
                        {formatVND(o.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
