import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== BẢNG MÀU CHÍNH THỨC — DAO PHÚC SEN =====
        // Thương hiệu (đỏ rượu vang)
        primary: "#8F1D21",
        primaryHover: "#72161A",
        primaryLight: "#B73A3E",
        // Nền
        cream: "#FFFFFF",
        sand: "#F8F7F5", // Background chung của trang
        section: "#FFFFFF",
        footerBg: "#1D1D1D",
        // Chữ
        ink: "#1F1F1F", // Tiêu đề
        inkLight: "#4A4A4A", // Nội dung
        textMuted: "#777777", // Chữ phụ
        textDisabled: "#BDBDBD",
        // Giá
        priceSale: "#8F1D21",
        priceOld: "#9A9A9A",
        discount: "#D43C2F",
        // Rating
        ratingStar: "#D89C17",
        soldText: "#707070",
        // Badge
        badgeBestSeller: "#7a1f1f",
        badgeBestSellerHover: "#932626",
        badgeSale: "#C62828",
        badgeNew: "#2E7D32",
        badgeLimited: "#FF9800",
        // Border
        blush: "#ECECEC", // border card mặc định
        // Icon
        iconDefault: "#666666",
        // Alias tương thích ngược — nhiều component cũ dùng "clay"/"clayDark"
        // làm màu accent/hover, nay trỏ thẳng vào bảng màu mới thay vì tông
        // vàng đồng cũ, để đổi màu toàn site chỉ qua 1 file này.
        clay: "#8F1D21", // = primary (dùng cho border hover, nút phụ...)
        clayDark: "#72161A", // = primaryHover (dùng cho hover nút chính...)
        secondary: "#8F1D21", // alias cũ — không còn màu vàng đồng riêng

        // ===== BẢNG MÀU "LÀNG DAO PHÚC SEN" (dark luxury — lấy từ style.css) =====
        // Dùng riêng cho giao diện chính / xem trước sản phẩm / chi tiết sản phẩm.
        // KHÔNG dùng trong trang quản lý (admin vẫn giữ bảng màu sáng cũ ở trên).
        daoBlack: "#0a0a0b",
        daoDark: "#111114",
        daoDark2: "#1a1a1f",
        daoDark3: "#222228",
        daoSilver: "#c0c0c8",
        daoSilverMuted: "#8a8a96",
        daoSilverLight: "#e8e8f0",
        daoWhite: "#f5f5f7",
        daoWine: "#6b1a1a",
        daoWineDeep: "#8b2222",
        daoWineLight: "#a02828",
        daoGold: "#c8960c",
        daoGoldLight: "#e0aa14",
        daoGreen: "#2e7d32",
        daoBorder: "rgba(192,192,200,0.12)",
        daoBorderHover: "rgba(160,40,40,0.4)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        soft: "14px",
        softLg: "16px",
      },
      boxShadow: {
        whisper: "0 8px 24px rgba(0, 0, 0, 0.06)", // Card shadow
        lift: "0 16px 40px rgba(0, 0, 0, 0.12)", // Hover shadow
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
