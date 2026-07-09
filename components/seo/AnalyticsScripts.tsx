"use client";

import Script from "next/script";
import { SITE } from "@/lib/seo";

/**
 * Chèn sẵn Google Analytics 4 + Google Tag Manager vào layout gốc.
 * Không làm gì cả nếu chưa điền NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_GTM_ID
 * trong .env.local — an toàn khi deploy mà chưa có tài khoản GA/GTM.
 */
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
  return (
    <>
      {SITE.gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${SITE.gaId}');
            `}
          </Script>
        </>
      )}

      {SITE.gtmId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${SITE.gtmId}');
          `}
        </Script>
      )}
    </>
  );
}
