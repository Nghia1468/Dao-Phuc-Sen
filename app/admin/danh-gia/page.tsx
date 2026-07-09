"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, X, Star, Trash2, RefreshCw } from "lucide-react";
import type { Review } from "@/lib/reviews";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tải được danh sách đánh giá.");
        setReviews([]);
      } else {
        setReviews(data.reviews);
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setApproved = async (id: string, approved: boolean) => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      await load();
    } catch {
      alert("Không thể kết nối máy chủ.");
    }
    setBusyId(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa đánh giá này?")) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      await load();
    } catch {
      alert("Không thể kết nối máy chủ.");
    }
    setBusyId(null);
  };

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Đánh giá khách hàng</h1>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-ink hover:text-clayDark transition-colors"
        >
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      {error && (
        <div className="bg-white border border-red-200 text-red-600 text-sm rounded-soft p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkLight">Đang tải...</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm uppercase tracking-wide text-clayDark mb-3">
              Chờ duyệt ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="text-sm text-inkLight">Không có đánh giá nào chờ duyệt.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((r) => (
                  <div key={r.id} className="bg-white rounded-softLg p-4 shadow-whisper flex gap-4">
                    {r.image && (
                      <div className="relative h-16 w-16 rounded-soft overflow-hidden shrink-0">
                        <Image src={r.image} alt="" fill sizes="64px" className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-ink">{r.author}</p>
                        <span className="text-xs text-inkLight">· SP: {r.productId}</span>
                        <span className="text-xs text-inkLight">· {r.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < r.rating ? "fill-clayDark text-clayDark" : "text-blush"}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-inkLight">{r.comment}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setApproved(r.id, true)}
                        disabled={busyId === r.id}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-blush text-clayDark hover:bg-clay hover:text-white transition-colors disabled:opacity-40"
                        aria-label="Duyệt"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        disabled={busyId === r.id}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-sand text-ink hover:bg-red-100 hover:text-red-500 transition-colors disabled:opacity-40"
                        aria-label="Xóa"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-wide text-clayDark mb-3">
              Đã hiển thị công khai ({approved.length})
            </h2>
            {approved.length === 0 ? (
              <p className="text-sm text-inkLight">Chưa có đánh giá nào được duyệt.</p>
            ) : (
              <div className="space-y-3">
                {approved.map((r) => (
                  <div key={r.id} className="bg-white rounded-softLg p-4 shadow-whisper flex gap-4">
                    {r.image && (
                      <div className="relative h-16 w-16 rounded-soft overflow-hidden shrink-0">
                        <Image src={r.image} alt="" fill sizes="64px" className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-ink">{r.author}</p>
                        <span className="text-xs text-inkLight">· SP: {r.productId}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < r.rating ? "fill-clayDark text-clayDark" : "text-blush"}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-inkLight">{r.comment}</p>
                    </div>
                    <button
                      onClick={() => remove(r.id)}
                      disabled={busyId === r.id}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-sand text-ink hover:bg-red-100 hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
                      aria-label="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
