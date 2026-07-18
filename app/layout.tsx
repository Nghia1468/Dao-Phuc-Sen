import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond, Be_Vietnam_Pro, Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import CartDrawer from "@/components/CartDrawer";
import FlashSalePopup from "@/components/FlashSalePopup";
import JsonLd from "@/components/seo/JsonLd";
import AnalyticsScripts, { GtmNoScript } from "@/components/seo/AnalyticsScripts";
import RouteChangeTracker from "@/components/seo/RouteChangeTracker";
import SocialProof from "@/components/SocialProof";
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

// Font riêng cho GIÁ SẢN PHẨM & THÔNG TIN ĐI KÈM GIÁ ở toàn bộ site (thẻ sản
// phẩm, trang chi tiết, giỏ hàng, thanh toán, admin...) — dùng qua class
// Tailwind `font-price`. Nạp sẵn 2 độ đậm (600 & 800) để khớp đúng với
// `font-semibold`/`font-extrabold` đang dùng trong code — nếu chỉ nạp 1 độ
// đậm, trình duyệt phải tự "giả lập" các độ đậm còn lại (hoặc rơi về font dự
// phòng), khiến chữ bị lệch cỡ trông như to nhỏ không đều dù cùng 1 class.
//
// LƯU Ý: Poppins không có sẵn subset "vietnamese" trên Google Fonts (chỉ có
// latin/latin-ext/devanagari), nên KHÔNG dùng class `font-price` cho chữ
// tiếng Việt có dấu (vd: "Miễn phí") — chỉ dùng cho số tiền/ký hiệu (0-9, ₫,
// dấu chấm/phẩy, dấu -) vì đó vốn là mục đích của font này. Nếu 1 chữ tiếng
// Việt có dấu lỡ dính class này, nó sẽ rơi về font dự phòng khác kích cỡ,
// trông giống lỗi "chữ to chữ nhỏ".
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "800"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
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
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable} ${beVietnam.variable} ${poppins.variable}`}
    >
      <head>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
      </head>
      <body className="font-body antialiased bg-white text-ink">
        <AnalyticsScripts />
        <GtmNoScript />
        <RouteChangeTracker />
        <ToastProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <FlashSalePopup />
            <SocialProof />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
