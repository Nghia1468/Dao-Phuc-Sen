import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqAccordion from "@/components/FaqAccordion";
import JsonLd from "@/components/seo/JsonLd";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";
import { faqs } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description:
    "Giải đáp các câu hỏi thường gặp về bảo hành, chọn cán sắt/cán gỗ, bảo quản dao, giao hàng COD và thời gian giao hàng tại Dao Phúc Sen.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Trang chủ", path: "/" },
          { name: "Câu hỏi thường gặp", path: "/faq" },
        ])}
      />
      <Header />
      <section className="pt-32 pb-24 px-5 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <p className="uppercase tracking-widest2 text-xs text-clayDark mb-3">
              Hỗ trợ
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-ink">
              Câu hỏi thường gặp
            </h1>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
