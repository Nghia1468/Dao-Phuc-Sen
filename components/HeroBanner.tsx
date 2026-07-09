"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Banner } from "@/lib/data";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function HeroBanner({ banners }: { banners: Banner[] }) {
  // Bấm "Mua ngay" / "Xem..." trên trang bìa (banner) sẽ cuộn mượt xuống khu
  // "Bán chạy nhất" — ngay bên dưới nó là "Sản phẩm mới", nên cuộn tới đây là
  // thấy được cả 2 khu vực.
  const scrollToBestSellers = () => {
    document.getElementById("bestsale")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative w-full h-[86vh] min-h-[520px] max-h-[880px]">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
        pagination={{ clickable: true, el: ".hero-pagination" }}
        loop
        className="h-full w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative h-full w-full">
              <Image
                src={banner.image}
                alt={banner.title}
                title={banner.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-black/5" />

              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto max-w-7xl w-full px-6 md:px-12">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="max-w-md text-white"
                  >
                    <p className="uppercase tracking-widest2 text-xs mb-4 text-daoSilverMuted">
                      Bộ sưu tập mới
                    </p>
                    <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">
                      {banner.title}
                    </h1>
                    <p className="text-sm md:text-base font-light mb-8 text-white/85">
                      {banner.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={scrollToBestSellers}
                        className="px-7 py-3 bg-daoDark2 text-daoWhite text-sm tracking-wide rounded-soft hover:bg-daoWine hover:text-white transition-colors duration-300"
                      >
                        {banner.primaryCta}
                      </button>
                      <button
                        onClick={scrollToBestSellers}
                        className="px-7 py-3 border border-white/70 text-white text-sm tracking-wide rounded-soft hover:bg-daoDark2/40 transition-colors duration-300"
                      >
                        {banner.secondaryCta}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Prev / Next */}
      <button
        className="hero-prev absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-daoDark2/70 backdrop-blur-sm text-white flex items-center justify-center hover:bg-daoDark2/40 transition-colors"
        aria-label="Trước"
      >
        ‹
      </button>
      <button
        className="hero-next absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-daoDark2/70 backdrop-blur-sm text-white flex items-center justify-center hover:bg-daoDark2/40 transition-colors"
        aria-label="Sau"
      >
        ›
      </button>

      {/* Pagination */}
      <div className="hero-pagination absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2" />
    </section>
  );
}
