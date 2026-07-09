import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Next.js tự động phục vụ file này tại /robots.txt
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/thanh-toan", "/dat-hang-thanh-cong"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
