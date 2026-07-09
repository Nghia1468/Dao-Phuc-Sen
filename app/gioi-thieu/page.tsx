import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Giới thiệu — Làng rèn Phúc Sen",
  description:
    "Lịch sử hơn 300 năm làng rèn Phúc Sen, Cao Bằng — nghệ nhân, quy trình rèn dao thủ công từ thép nhíp đỏ Nga, hình ảnh và video thực tế tại làng nghề.",
  alternates: { canonical: "/gioi-thieu" },
};

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Chọn & nung thép",
    desc: "Thép nhíp ô tô đã qua sử dụng (thường gọi \"nhíp đỏ Nga\") được nung đỏ trong lò than truyền thống đến nhiệt độ phù hợp để rèn.",
  },
  {
    step: "02",
    title: "Rèn tạo hình",
    desc: "Nghệ nhân dùng búa tạ và đe rèn thủ công, gõ tạo hình lưỡi dao theo từng loại (chặt, thái, bầu, lọc) — hoàn toàn bằng tay, không khuôn đúc.",
  },
  {
    step: "03",
    title: "Tôi thép",
    desc: "Nung lại rồi làm nguội nhanh trong nước hoặc dầu ở thời điểm chính xác để thép đạt độ cứng cao mà vẫn giữ được độ dẻo dai, tránh giòn gãy.",
  },
  {
    step: "04",
    title: "Mài & lắp cán",
    desc: "Mài dũa hoàn thiện lưỡi dao trên đá mài truyền thống, sau đó lắp cán sắt hoặc cán gỗ nghiến tùy theo đơn đặt hàng.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Trang chủ", path: "/" },
          { name: "Giới thiệu", path: "/gioi-thieu" },
        ])}
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[46vh] min-h-[320px] w-full">
        <Image
          src="/images/brand/hero-1.jpg"
          alt="Làng rèn Phúc Sen, Cao Bằng"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
          <p className="uppercase tracking-widest2 text-xs text-white/80 mb-3">
            Giới thiệu
          </p>
          <h1 className="font-display text-3xl md:text-5xl text-white max-w-2xl">
            Làng rèn Phúc Sen — hơn 300 năm giữ lửa nghề
          </h1>
        </div>
      </section>

      {/* Lịch sử làng nghề */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="uppercase tracking-widest2 text-xs text-clayDark mb-3">
            Lịch sử làng nghề
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-6">
            Từ một làng nhỏ ở Cao Bằng đến thương hiệu dao rèn được cả nước biết đến
          </h2>
          <p className="text-inkLight font-light leading-relaxed mb-4">
            Nằm tại xã Phúc Sen, huyện Quảng Uyên, tỉnh Cao Bằng, làng rèn Phúc Sen
            hình thành và phát triển hơn 300 năm, gắn liền với cộng đồng người Nùng An
            sinh sống tại đây. Nghề rèn được truyền từ đời này qua đời khác, trở thành
            sinh kế chính của phần lớn các hộ gia đình trong làng.
          </p>
          <p className="text-inkLight font-light leading-relaxed">
            Ngày nay, tiếng búa đe vẫn vang lên đều đặn mỗi ngày trong làng — không chỉ
            là công việc mưu sinh mà còn là niềm tự hào, là ký ức tuổi thơ của biết bao
            thế hệ người Phúc Sen được truyền lại nguyên vẹn cho đến hôm nay.
          </p>
        </div>
      </section>

      {/* Nghệ nhân */}
      <section className="bg-sand px-5 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="uppercase tracking-widest2 text-xs text-clayDark mb-3">
            Nghệ nhân
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-6">
            Đôi bàn tay giữ hồn cho từng lưỡi dao
          </h2>
          <p className="text-inkLight font-light leading-relaxed mb-4">
            Mỗi nghệ nhân Phúc Sen thường học nghề từ khi còn nhỏ, quan sát cha ông rèn
            dao mỗi ngày trước khi tự tay cầm búa. Không có bản vẽ hay khuôn mẫu cố
            định — kinh nghiệm và cảm nhận qua từng nhát búa mới là điều quyết định
            một lưỡi dao bén, bền và cân tay.
          </p>
          <p className="text-inkLight font-light leading-relaxed">
            Chính sự tỉ mỉ và kiên nhẫn ấy tạo nên sự khác biệt giữa dao rèn thủ công
            Phúc Sen với dao sản xuất công nghiệp hàng loạt — mỗi con dao mang một dấu
            ấn tay nghề riêng, dùng càng lâu càng thấy rõ.
          </p>
        </div>
      </section>

      {/* Quy trình rèn */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="uppercase tracking-widest2 text-xs text-clayDark mb-3">
              Quy trình rèn
            </p>
            <h2 className="font-display text-2xl md:text-3xl text-ink">
              4 công đoạn tạo nên 1 lưỡi dao Phúc Sen
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((s) => (
              <div key={s.step} className="bg-white rounded-softLg shadow-whisper p-6">
                <span className="font-display text-3xl text-blush">{s.step}</span>
                <h3 className="text-ink font-medium mt-3 mb-2">{s.title}</h3>
                <p className="text-sm text-inkLight font-light leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hình ảnh */}
      <section className="bg-sand px-5 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest2 text-xs text-clayDark mb-3">
              Hình ảnh
            </p>
            <h2 className="font-display text-2xl md:text-3xl text-ink">
              Không khí làng nghề Phúc Sen
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              "/images/brand/hero-1.jpg",
              "/images/brand/hero-2.jpg",
              "/images/brand/hero-3.jpg",
              "/images/brand/hero-4.jpg",
            ].map((src) => (
              <div key={src} className="relative aspect-square rounded-softLg overflow-hidden">
                <Image src={src} alt="Làng rèn Phúc Sen" fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="uppercase tracking-widest2 text-xs text-clayDark mb-3">
            Video
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-8">
            Xem nghệ nhân Phúc Sen rèn dao thủ công
          </h2>
          <div className="relative rounded-softLg overflow-hidden shadow-lift bg-black">
            <video
              controls
              poster="/images/brand/hero-2.jpg"
              className="w-full h-auto"
              preload="none"
            >
              <source src="/images/brand/video-ren-dao.mp4" type="video/mp4" />
            </video>
          </div>
          {/*
          <p className="text-xs text-inkLight mt-4">
            Video có thể thay bằng nhúng YouTube — chỉ cần đổi thẻ{" "}
            <code className="bg-sand px-1.5 py-0.5 rounded">&lt;video&gt;</code> ở trên
            thành <code className="bg-sand px-1.5 py-0.5 rounded">&lt;iframe&gt;</code>{" "}
            với URL nhúng YouTube.
          </p>
          */}
        </div>
      </section>

      {/* Liên hệ nhanh */}
      <section className="bg-ink text-white px-5 md:px-8 py-14 text-center">
        <p className="font-display text-xl md:text-2xl mb-2">
          Ghé thăm hoặc đặt hàng trực tiếp
        </p>
        <p className="text-white/70 font-light">
          {SITE.address.streetAddress}, {SITE.address.addressLocality} · {SITE.phone}
        </p>
      </section>

      <Footer />
    </main>
  );
}
