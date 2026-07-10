import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import StatsBar from "@/components/StatsBar";
import NewProducts from "@/components/NewProducts";
import VoucherSection from "@/components/VoucherSection";
import BestSellers from "@/components/BestSellers";
import Testimonials from "@/components/Testimonials";
import FloatingActions from "@/components/FloatingActions";
import Footer from "@/components/Footer";
import { getVouchers } from "@/lib/vouchers";
import { getLatestApprovedReviews } from "@/lib/reviews";
import {
  getNewProducts,
  getBestSellers,
  getBanners,
  getProductById,
} from "@/lib/catalog";

export const revalidate = 30; // ISR: cache 30s để giảm tải, khớp cache trong lib/catalog.ts

export default async function HomePage() {
  const [banners, vouchers, newProducts, bestSellers, reviews] =
    await Promise.all([
      getBanners(),
      getVouchers(),
      getNewProducts(8),
      getBestSellers(5),
      getLatestApprovedReviews(3),
    ]);

  // Gắn tên sản phẩm mà khách đã đánh giá — hiển thị ở khối "Khách hàng nói gì".
  const reviewsWithProduct = await Promise.all(
    reviews.map(async (r) => ({
      ...r,
      productName: (await getProductById(r.productId))?.name,
    }))
  );

  return (
    <main className="min-h-screen bg-daoBlack">
      <Header />
      <HeroBanner banners={banners} />
      <StatsBar />
      <BestSellers products={bestSellers} />
      <NewProducts products={newProducts} />
      <div className="seam max-w-7xl mx-auto" />
      <VoucherSection vouchers={vouchers} />
      <Testimonials reviews={reviewsWithProduct} />
      <Footer />
      <FloatingActions />
    </main>
  );
}
