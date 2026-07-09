import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { marked } from "marked";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getPublishedPosts();
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Nội dung viết dạng Markdown ở trang Admin, render ra HTML tại đây.
  const contentHtml = marked.parse(post.content, { async: false }) as string;

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={articleSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Trang chủ", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <Header />

      <article className="pt-24 pb-24 px-5 md:px-8">
        <div className="mx-auto max-w-3xl">
          <nav className="text-xs text-inkLight mb-6">
            <a href="/" className="hover:text-clayDark transition-colors">Trang chủ</a>
            <span className="mx-2">/</span>
            <a href="/blog" className="hover:text-clayDark transition-colors">Blog</a>
          </nav>

          <p className="text-xs text-inkLight mb-3">
            {new Date(post.publishedAt).toLocaleDateString("vi-VN")} · {post.author}
          </p>
          {/* Mỗi trang chỉ 1 H1 duy nhất */}
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="relative aspect-[16/9] rounded-softLg overflow-hidden bg-sand mb-10">
            <Image
              src={post.coverImage}
              alt={post.title}
              title={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>

          {/* prose: style thủ công bằng Tailwind vì chưa cài @tailwindcss/typography */}
          <div
            className="prose-blog text-sm md:text-base text-inkLight font-light leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </article>

      {related.length > 0 && (
        <section className="pb-24 px-5 md:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl text-ink mb-8 text-center">
              Bài viết khác
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-soft overflow-hidden bg-sand mb-3">
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-sm text-ink group-hover:text-clayDark transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
