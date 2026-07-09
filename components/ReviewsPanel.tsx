"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ImagePlus, X } from "lucide-react";
import type { Review } from "@/lib/reviews";

export default function ReviewsPanel({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [formOpen, setFormOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleImagePick = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh quá lớn (tối đa 5MB) — vui lòng chọn ảnh khác.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!author.trim() || !comment.trim()) {
      setError("Vui lòng nhập tên và nội dung đánh giá.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          author: author.trim(),
          rating,
          comment: comment.trim(),
          image: imageDataUrl ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không gửi được đánh giá.");
      } else {
        setMessage(data.message ?? "Cảm ơn bạn đã đánh giá!");
        setAuthor("");
        setComment("");
        setImageDataUrl(null);
        setRating(5);
        setFormOpen(false);
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl">
      {avgRating && (
        <div className="flex items-center gap-3 mb-6">
          <span className="font-display text-3xl text-daoWhite">{avgRating}</span>
          <div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(Number(avgRating))
                      ? "fill-daoGold text-daoGold"
                      : "text-daoSilverMuted"
                  }
                />
              ))}
            </div>
            <p className="text-xs text-daoSilver mt-0.5">{reviews.length} đánh giá</p>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-daoSilver font-light mb-6">
          Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!
        </p>
      ) : (
        <ul className="space-y-5 mb-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-daoBorder pb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-sm font-medium text-daoWhite">{r.author}</p>
                <span className="text-xs text-daoSilver">{r.date}</span>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < r.rating ? "fill-daoGold text-daoGold" : "text-daoSilverMuted"}
                  />
                ))}
              </div>
              <p className="text-sm text-daoSilver font-light leading-relaxed">
                {r.comment}
              </p>
              {r.image && (
                <div className="relative h-24 w-24 rounded-soft overflow-hidden mt-3">
                  <Image src={r.image} alt={`Ảnh thực tế từ ${r.author}`} fill sizes="96px" className="object-cover" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {message && <p className="text-sm text-daoWineLight mb-4">{message}</p>}

      {!formOpen ? (
        <button
          onClick={() => setFormOpen(true)}
          className="text-sm text-daoWineLight border border-daoWine rounded-soft px-5 py-2.5 hover:bg-daoWine hover:text-white transition-colors"
        >
          Viết đánh giá
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-daoDark/60 rounded-softLg p-5 space-y-4">
          <div>
            <label className="text-xs text-daoSilver">Số sao</label>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  aria-label={`${i + 1} sao`}
                >
                  <Star
                    size={22}
                    className={i < rating ? "fill-daoGold text-daoGold" : "text-daoSilverMuted"}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            required
            placeholder="Tên của bạn *"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border border-daoBorder rounded-soft px-4 py-2.5 text-sm bg-daoDark2 text-daoWhite placeholder:text-daoSilverMuted focus:outline-none focus:border-daoWineLight"
          />
          <textarea
            required
            rows={3}
            placeholder="Cảm nhận của bạn về sản phẩm *"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-daoBorder rounded-soft px-4 py-2.5 text-sm bg-daoDark2 text-daoWhite placeholder:text-daoSilverMuted focus:outline-none focus:border-daoWineLight"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-soft border border-daoWine text-daoWineLight hover:bg-daoWine hover:text-white transition-colors cursor-pointer">
              <ImagePlus size={14} />
              Thêm ảnh thực tế
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImagePick(e.target.files?.[0])}
              />
            </label>
            {imageDataUrl && (
              <div className="relative h-12 w-12 rounded-soft overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageDataUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageDataUrl(null)}
                  className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-soft p-0.5"
                  aria-label="Xóa ảnh"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-daoWine text-white text-sm rounded-soft hover:bg-daoWineDeep transition-colors disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-6 py-2.5 border border-daoBorder text-daoWhite text-sm rounded-soft hover:border-daoWine transition-colors"
            >
              Huỷ
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
