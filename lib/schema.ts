// ---------------------------------------------------------------------------
// Schema.org JSON-LD — giúp Google hiển thị Rich Results (sao đánh giá, FAQ,
// breadcrumb, giá sản phẩm...) ngay trên trang kết quả tìm kiếm.
// Dùng cùng component <JsonLd /> ở components/seo/JsonLd.tsx.
// ---------------------------------------------------------------------------

import { SITE, absoluteUrl } from "./seo";
import type { Product } from "./data";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/images/brand/logo.png"),
    sameAs: [SITE.social.facebook, SITE.social.instagram].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["vi"],
    },
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    name: SITE.name,
    image: absoluteUrl("/images/brand/logo.png"),
    url: SITE.url,
    telephone: SITE.phone,
    priceRange: "₫₫",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.streetAddress,
      addressLocality: SITE.address.addressLocality,
      addressRegion: SITE.address.addressRegion,
      /*postalCode: SITE.address.postalCode,*/
      addressCountry: SITE.address.addressCountry,
    },
    openingHoursSpecification: SITE.openingHours.map((o) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: o.days,
      opens: o.opens,
      closes: o.closes,
    })),
  };
}

export interface ReviewForSchema {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export function productSchema(
  product: Product,
  reviews: ReviewForSchema[] = []
) {
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : product.rating;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/san-pham/${product.id}`),
      priceCurrency: "VND",
      price: product.salePrice ?? product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: Math.max(reviews.length, product.sold ? Math.round(product.sold / 10) : 1),
          },
        }
      : {}),
    ...(reviews.length > 0
      ? {
          review: reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.comment,
            datePublished: r.date,
          })),
        }
      : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function articleSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  author: string;
  publishedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/brand/logo.png") },
    },
    datePublished: post.publishedAt,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };
}
