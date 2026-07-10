import { Star } from "lucide-react";
import type { Review } from "@/lib/reviews";
import SectionHeading from "./SectionHeading";

// Vài màu nền avatar để xoay vòng cho đẹp mắt (không có ảnh đại diện thật).
const AVATAR_COLORS = ["bg-daoWine", "bg-daoDark3", "bg-daoWineDeep"];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export type ReviewWithProduct = Review & { productName?: string };

export default function Testimonials({ reviews }: { reviews: ReviewWithProduct[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="py-20 px-5 md:px-8 bg-daoBlack">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Đánh giá"
          title="Khách hàng nói gì"
          description="Cảm nhận thật từ những khách hàng đã sử dụng dao Phúc Sen."
        />
        <div className="flex flex-wrap justify-center gap-5 md:gap-6">
          {reviews.map((r, i) => (
            <div
              key={r.id}
              className="relative bg-daoDark2 border border-daoBorder rounded-softLg p-6 flex flex-col w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-md"
            >
              {r.productName && (
                <p className="text-xs uppercase tracking-widest2 text-daoWineLight mb-3 truncate">
                  {r.productName}
                </p>
              )}

              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    size={14}
                    className={si < r.rating ? "fill-daoGold text-daoGold" : "text-daoSilverMuted"}
                  />
                ))}
              </div>

              <p className="text-sm text-daoSilverLight font-light italic leading-relaxed mb-6 flex-1">
                &ldquo;{r.comment}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {r.author.trim().charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-daoWhite">{r.author}</p>
                  <p className="text-xs text-daoSilverMuted">{formatDate(r.date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
