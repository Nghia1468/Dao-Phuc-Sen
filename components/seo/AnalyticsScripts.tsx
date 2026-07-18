"use client";

import Script from "next/script";
import { SITE } from "@/lib/seo";

// ---------------------------------------------------------------------------
// CHỈ nhúng Google Tag Manager. Không nhúng gtag.js (GA4) hay Meta Pixel trực
// tiếp — 2 cái đó cấu hình BÊN TRONG GTM (Tag Manager UI), theo đúng yêu cầu
// "mọi tracking phải đi qua GTM". Không hoạt động gì cả nếu chưa điền
// NEXT_PUBLIC_GTM_ID trong .env.local — an toàn khi deploy mà chưa có GTM.
// ---------------------------------------------------------------------------

export function GtmNoScript() {
  if (!SITE.gtmId) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${SITE.gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

export default function AnalyticsScripts() {
  if (!SITE.gtmId) return null;
  return (
    <Script id="gtm-init" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        // Đẩy sẵn ID cấu hình (đọc từ process.env, KHÔNG hardcode) vào
        // dataLayer TRƯỚC khi container GTM khởi tạo — nhờ vậy trong GTM có
        // thể tạo Data Layer Variable (vd: DLV - fbPixelId) để điền vào ô
        // Pixel ID của tag Meta Pixel, thay vì phải gõ tay ID vào GTM.
        window.dataLayer.push({
          ga_id: ${JSON.stringify(SITE.gaId ?? "")},
          fb_pixel_id: ${JSON.stringify(SITE.fbPixelId ?? "")}
        });
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${SITE.gtmId}');
      `}
    </Script>
  );
}
