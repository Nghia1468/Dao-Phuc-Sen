import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { searchProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Kết quả tìm kiếm",
  robots: { index: false, follow: true }, // trang kết quả tìm kiếm không cần Google index
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = await searchProducts(q);

  return (
    <main className="min-h-screen bg-daoBlack">
      <Header />

      <section className="pt-32 pb-20 px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="text-xs text-daoSilver mb-4">
            <a href="/" className="hover:text-daoWineLight transition-colors">
              Trang chủ
            </a>
            <span className="mx-2">/</span>
            <span className="text-daoWhite">Tìm kiếm</span>
          </nav>

          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="uppercase tracking-widest2 text-xs text-daoWineLight mb-3">
              Kết quả tìm kiếm
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-daoWhite">
              {q ? `“${q}”` : "Tìm kiếm sản phẩm"}
            </h1>
            <p className="mt-3 text-sm text-daoSilver font-light">
              {q
                ? `${products.length} sản phẩm phù hợp`
                : "Nhập từ khoá ở ô tìm kiếm phía trên để bắt đầu"}
            </p>
          </div>

          {q ? (
            <CategoryProductGrid products={products} />
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}
