import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedPosts } from "@/lib/blog";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Blog — Kiến thức nghề rèn & chăm sóc dao",
  description:
    "Cách chọn dao phù hợp, cách mài dao đúng kỹ thuật, cách bảo quản dao và câu chuyện làng rèn Phúc Sen — cập nhật tại blog Dao Phúc Sen.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-24 px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="uppercase tracking-widest2 text-xs text-clayDark mb-3">
              Blog
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-ink">
              Kiến thức nghề rèn & chăm sóc dao
            </h1>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-sm text-inkLight">
              Chưa có bài viết nào.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-soft overflow-hidden bg-sand mb-4">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      title={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-silk group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs text-inkLight mb-1.5">
                    {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                  </p>
                  <h2 className="font-display text-xl text-ink mb-2 group-hover:text-clayDark transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-inkLight font-light line-clamp-2">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
