// ---------------------------------------------------------------------------
// Cấu hình trung tâm cho SEO — Đổi các giá trị dưới đây (đặc biệt SITE_URL,
// địa chỉ, số điện thoại, giờ làm việc) cho đúng với cửa hàng thật của bạn.
// File này được dùng lại ở: metadata từng trang, JSON-LD Schema.org, sitemap,
// robots.txt, và phần thông tin liên kết Google Business Profile ở Footer.
// ---------------------------------------------------------------------------

export const SITE = {
  name: "Dao Phúc Sen",
  shortName: "Phúc Sen",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://langdaophucsencaobang.shop",
  description:
    "Dao Phúc Sen Cao Bằng — làng nghề rèn dao thủ công truyền thống hơn 300 năm. Dao chặt, dao thái, dao bầu, dao lọc, combo dao bếp — rèn tay từ thép nhíp đỏ Nga, bền sắc, giao toàn quốc.",

  locale: "vi_VN",
  themeColor: "#1D1D1D",
  // Thông tin liên hệ — dùng cho Schema LocalBusiness + Google Business Profile + Footer.
  phone: "0934596198",
  email: "lienhe@langdaophucsencaobang.shop",
  address: {
    streetAddress: "Xã Phúc Sen, Huyện Quảng Uyên",
    addressLocality: "Cao Bằng",
    addressRegion: "Cao Bằng",
    addressCountry: "VN",
  },
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:30", closes: "20:00" },
    { days: ["Saturday", "Sunday"], opens: "07:30", closes: "20:00" },
  ],
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61550896644757",
    zalo: "https://zalo.me/0934596198",
    instagram: "",
  },
  // Google Analytics 4 / Google Tag Manager — điền ID thật vào .env.local:
  // NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
  // NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,
};

/** Ghép URL tuyệt đối từ 1 đường dẫn tương đối, dùng cho canonical/OG/schema. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}
