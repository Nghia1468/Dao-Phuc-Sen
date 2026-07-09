import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { getCategoryBySlug, categories } from "@/lib/data";
import { getProductsByCategory } from "@/lib/catalog";

export const revalidate = 30; // ISR: cache 30s thay vì render lại mỗi request (khớp cache lib/catalog.ts)

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const title = `${category.name} — Thiết kế tinh tế, chất liệu chọn lọc`;
  const description = `Mua ${category.name.toLowerCase()} rèn thủ công chính hãng tại Dao Phúc Sen — thép nhíp đỏ Nga, cán sắt/cán gỗ, giao hàng toàn quốc.`;

  return {
    title,
    description,
    alternates: { canonical: `/danh-muc/${category.slug}` },
    openGraph: {
      title,
      description,
      images: [category.image],
      url: `/danh-muc/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <main className="min-h-screen bg-daoBlack">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Trang chủ", path: "/" },
          { name: category.name, path: `/danh-muc/${category.slug}` },
        ])}
      />
      <Header />

      <section className="pt-32 pb-20 px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="text-xs text-daoSilver mb-4">
            <a href="/" className="hover:text-daoWineLight transition-colors">
              Trang chủ
            </a>
            <span className="mx-2">/</span>
            <span className="text-daoWhite">{category.name}</span>
          </nav>

          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="uppercase tracking-widest2 text-xs text-daoWineLight mb-3">
              Danh mục
            </p>
            {/* Mỗi trang chỉ 1 H1 duy nhất */}
            <h1 className="font-display text-3xl md:text-4xl text-daoWhite">
              {category.name}
            </h1>
            <p className="mt-3 text-sm text-daoSilver font-light">
              {products.length} sản phẩm
            </p>
          </div>

          <CategoryProductGrid products={products} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
