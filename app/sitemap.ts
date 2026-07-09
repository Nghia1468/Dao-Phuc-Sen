import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { categories } from "@/lib/data";
import { getCatalog } from "@/lib/catalog";
import { getPublishedPosts } from "@/lib/blog";

// Next.js tự động phục vụ file này tại /sitemap.xml
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getCatalog(), getPublishedPosts()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/sale`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/gioi-thieu`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE.url}/danh-muc/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/san-pham/${p.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...postPages];
}
