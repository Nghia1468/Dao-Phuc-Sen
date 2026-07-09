import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailView from "@/components/ProductDetailView";
import JsonLd from "@/components/seo/JsonLd";
import { productSchema, breadcrumbSchema } from "@/lib/schema";
import { getProductById, getRelatedProducts } from "@/lib/catalog";
import { getApprovedReviews } from "@/lib/reviews";
import { categories } from "@/lib/data";

export const revalidate = 30; // ISR: cache 30s thay vì render lại mỗi request (khớp cache lib/catalog.ts)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};

  const title = `${product.name} — ${product.category}`;
  const description = product.description
    ? product.description.slice(0, 155)
    : `${product.name} chính hãng tại Dao Phúc Sen, giao hàng toàn quốc, đổi trả 7 ngày.`;

  return {
    title,
    description,
    alternates: { canonical: `/san-pham/${product.id}` },
    openGraph: {
      title,
      description,
      images: product.images.slice(0, 4),
      url: `/san-pham/${product.id}`,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product, 4),
    getApprovedReviews(product.id),
  ]);

  // Slug thật của danh mục (để link breadcrumb không bị lỗi, trước đây trỏ
  // nhầm bằng tên tiếng Việt có dấu thay vì đúng slug URL).
  const categorySlug =
    categories.find((c) => c.name === product.category)?.slug ?? "";

  const reviewsForSchema = reviews.map((r) => ({
    author: r.author,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
  }));

  return (
    <main className="min-h-screen bg-daoBlack">
      <JsonLd data={productSchema(product, reviewsForSchema)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Trang chủ", path: "/" },
          { name: product.category, path: `/danh-muc/${categorySlug}` },
          { name: product.name, path: `/san-pham/${product.id}` },
        ])}
      />
      <Header />
      <section className="pt-32 pb-20 px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="text-xs text-daoSilver mb-8">
            <a href="/" className="hover:text-daoWineLight transition-colors">
              Trang chủ
            </a>
            <span className="mx-2">/</span>
            <a
              href={`/danh-muc/${categorySlug}`}
              className="hover:text-daoWineLight transition-colors"
            >
              {product.category}
            </a>
            <span className="mx-2">/</span>
            <span className="text-daoWhite">{product.name}</span>
          </nav>

          <ProductDetailView product={product} related={related} reviews={reviews} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
