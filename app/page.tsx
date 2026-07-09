import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import NewProducts from "@/components/NewProducts";
import VoucherSection from "@/components/VoucherSection";
import SaleSection from "@/components/SaleSection";
import BestSellers from "@/components/BestSellers";
import Footer from "@/components/Footer";
import { getVouchers } from "@/lib/vouchers";
import {
  getNewProducts,
  getSaleProducts,
  getBestSellers,
  getBanners,
} from "@/lib/catalog";

export const revalidate = 30; // ISR: cache 30s để giảm tải, khớp cache trong lib/catalog.ts

export default async function HomePage() {
  const [banners, vouchers, newProducts, saleProducts, bestSellers] =
    await Promise.all([
      getBanners(),
      getVouchers(),
      getNewProducts(8),
      getSaleProducts(4),
      getBestSellers(5),
    ]);

  return (
    <main className="min-h-screen bg-daoBlack">
      <Header />
      <HeroBanner banners={banners} />
      <BestSellers products={bestSellers} />
      <NewProducts products={newProducts} />
      <div className="seam max-w-7xl mx-auto" />
      <VoucherSection vouchers={vouchers} />
      <SaleSection products={saleProducts} />
      <Footer />
    </main>
  );
}
