import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { getAllSaleProductsAcrossCategories } from "@/lib/catalog";

export const revalidate = 30; // ISR: cache 30s thay vì render lại mỗi request (khớp cache lib/catalog.ts)

export default async function SalePage() {
  const saleProducts = await getAllSaleProductsAcrossCategories();

  return (
    <main className="min-h-screen bg-daoBlack">
      <Header />

      <section className="pt-24 pb-20 px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="text-xs text-daoSilver mb-4">
            <a href="/" className="hover:text-daoWineLight transition-colors">
              Trang chủ
            </a>
            <span className="mx-2">/</span>
            <span className="text-daoWhite">Sale</span>
          </nav>

          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="uppercase tracking-widest2 text-xs text-daoWineLight mb-3">
              Ưu đãi
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-daoWhite">
              Tất cả sản phẩm Sale
            </h1>
            <p className="mt-3 text-sm text-daoSilver font-light">
              {saleProducts.length} sản phẩm đang giảm giá
            </p>
          </div>

          <CategoryProductGrid products={saleProducts} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
