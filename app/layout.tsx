import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import CartDrawer from "@/components/CartDrawer";
import FlashSalePopup from "@/components/FlashSalePopup";
import JsonLd from "@/components/seo/JsonLd";
import AnalyticsScripts, { GtmNoScript } from "@/components/seo/AnalyticsScripts";
import { organizationSchema, localBusinessSchema } from "@/lib/schema";
import { SITE } from "@/lib/seo";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

// Font cho giao diện mới "Dark Luxury" (Rolex × Bentley × Montblanc) — áp dụng
// trước cho trang chủ. Các trang khác vẫn dùng Playfair/Inter (font-display/
// font-body) cho tới khi được chuyển đổi giao diện.
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-be-vietnam",
  display: "swap",
  preload: false,
});

// Metadata mặc định — mỗi trang con (trang chủ, danh mục, sản phẩm, blog...)
// tự khai báo `export const metadata` hoặc `generateMetadata()` riêng để ghi
// đè Title/Description/OG/Canonical cho đúng nội dung trang đó (không dùng
// chung 1 Title cho toàn site).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: SITE.themeColor,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Dao rèn thủ công Cao Bằng`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "dao phúc sen",
    "dao phúc sen cao bằng",
    "làng dao phúc sen cao bằng",
    "dao bếp phúc sen",
    "dao rèn thủ công",
    "dao chặt gà",
    "dao thái thịt",
    "dao bầu phúc sen",
    "combo dao bếp",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} — Dao rèn thủ công Cao Bằng`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Dao rèn thủ công Cao Bằng`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable} ${beVietnam.variable}`}
    >
      <head>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
      </head>
      <body className="font-body antialiased bg-white text-ink">
        <AnalyticsScripts />
        <GtmNoScript />
        <ToastProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <FlashSalePopup />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
