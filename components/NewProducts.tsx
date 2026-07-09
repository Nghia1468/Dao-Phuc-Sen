import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

export default function NewProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-20 px-5 md:px-8 bg-dlSection">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Mới về"
          title="Sản phẩm mới"
          description="Cập nhật mỗi tuần — chọn lọc từ những mẫu dao rèn thủ công mới nhất."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
