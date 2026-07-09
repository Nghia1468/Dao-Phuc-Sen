"use client";

import { useEffect, useState } from "react";
import { X, Ticket, CheckCircle2, Ban } from "lucide-react";
import { formatVND, type Voucher } from "@/lib/data";

interface VoucherRow {
  voucher: Voucher;
  usable: boolean;
  reason?: string;
}

export default function VoucherListModal({
  subtotal,
  appliedCodes,
  onClose,
  onSelect,
}: {
  subtotal: number;
  appliedCodes: string[];
  onClose: () => void;
  onSelect: (code: string) => void;
}) {
  const [rows, setRows] = useState<VoucherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/vouchers/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtotal, appliedCodes }),
        });
        const data = await res.json();
        if (!cancelled) {
          if (!res.ok) {
            setError(data.error ?? "Không tải được danh sách mã giảm giá.");
          } else {
            setRows(data.vouchers);
          }
        }
      } catch {
        if (!cancelled) setError("Không thể kết nối máy chủ.");
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, appliedCodes.join(",")]);

  const usableRows = rows.filter((r) => r.usable);
  const unusableRows = rows.filter((r) => !r.usable);

  const valueLabel = (v: Voucher) => {
    if (v.type === "freeship") return "Miễn phí vận chuyển";
    if (v.type === "percent") return `Giảm ${v.value}%`;
    return `Giảm ${formatVND(v.value)}`;
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-daoDark2 w-full sm:max-w-md sm:rounded-softLg rounded-t-softLg max-h-[85vh] flex flex-col shadow-[0_18px_50px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between px-5 h-14 border-b border-daoBorder shrink-0">
          <h2 className="font-display text-lg text-daoWhite">Chọn mã giảm giá</h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="text-daoWhite hover:text-daoWineLight"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-daoSilver text-center py-10">Đang tải...</p>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-10">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-daoSilver text-center py-10">
              Hiện chưa có mã giảm giá nào.
            </p>
          ) : (
            <div className="space-y-6">
              {usableRows.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-daoWineLight mb-2.5">
                    Có thể sử dụng
                  </p>
                  <div className="space-y-2.5">
                    {usableRows.map(({ voucher }) => (
                      <button
                        key={voucher.code}
                        onClick={() => onSelect(voucher.code)}
                        className="w-full flex items-center gap-3 border border-daoWine rounded-soft p-3.5 text-left hover:bg-daoDark/60 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-daoDark3 flex items-center justify-center shrink-0">
                          <Ticket size={17} className="text-daoWineLight" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base text-daoWhite">
                            {voucher.code}
                          </p>
                          <p className="text-xs text-daoSilver line-clamp-1">
                            {voucher.label}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-daoWineLight">
                            {valueLabel(voucher)}
                          </p>
                          <CheckCircle2 size={16} className="text-daoWineLight ml-auto mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {unusableRows.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-daoSilver mb-2.5">
                    Không thể sử dụng
                  </p>
                  <div className="space-y-2.5">
                    {unusableRows.map(({ voucher, reason }) => (
                      <div
                        key={voucher.code}
                        className="w-full flex items-center gap-3 border border-daoBorder rounded-soft p-3.5 opacity-60"
                      >
                        <div className="h-10 w-10 rounded-full bg-daoDark flex items-center justify-center shrink-0">
                          <Ticket size={17} className="text-daoSilver" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base text-daoWhite">
                            {voucher.code}
                          </p>
                          <p className="text-xs text-daoSilver line-clamp-1">
                            {voucher.label}
                          </p>
                        </div>
                        <div className="text-right shrink-0 max-w-[120px]">
                          <p className="text-sm text-daoSilver">{valueLabel(voucher)}</p>
                          <p className="text-[11px] text-red-400 flex items-center gap-1 justify-end mt-1">
                            <Ban size={12} />
                            {reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
