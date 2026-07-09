import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

export default function BestSellers({ products }: { products: Product[] }) {
  return (
    <section id="bestsale" className="py-20 px-5 md:px-8 bg-daoDark/60">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Top 5"
          title="Bán chạy nhất"
          description="Những món được yêu thích và lựa chọn nhiều nhất."
        />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} badge="best-seller" />
          ))}
        </div>
      </div>
    </section>
  );
}
