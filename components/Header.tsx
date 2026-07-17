"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { categories, formatVND } from "@/lib/data";
import type { MegaMenuCategory } from "@/app/api/mega-menu/route";

const NAV_ITEMS = [
  { label: "Sale", href: "/sale" },
  { label: "Dao chặt", href: "/danh-muc/dao-chat", megaSlug: "dao-chat" },
  { label: "Dao thái", href: "/danh-muc/dao-thai", megaSlug: "dao-thai" },
  { label: "Dao bầu/lọc", href: "/danh-muc/dao-bau", megaSlug: "dao-bau" },
  { label: "Combo", href: "/danh-muc/combo" },
  { label: "Đá mài", href: "/danh-muc/da-mai" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Blog", href: "/blog" },
];

// Các mục ở dưới không phải danh mục sản phẩm — hiển thị riêng trong ngăn "Khác"
// của menu mobile, tách biệt khỏi danh sách 6 danh mục dao.
const OTHER_LINKS = NAV_ITEMS.filter(
  (item) => !categories.some((c) => item.href === `/danh-muc/${c.slug}`)
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [megaSlug, setMegaSlug] = useState<string | null>(null);
  const [megaData, setMegaData] = useState<Record<string, MegaMenuCategory>>({});
  const { totalQuantity, openCart } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tải dữ liệu Mega Menu (ảnh danh mục + sản phẩm nổi bật) 1 lần khi vào trang.
  useEffect(() => {
    fetch("/api/mega-menu")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.categories) return;
        const map: Record<string, MegaMenuCategory> = {};
        for (const c of data.categories as MegaMenuCategory[]) map[c.slug] = c;
        setMegaData(map);
      })
      .catch(() => {});
  }, []);

  // Đóng menu/search khi chuyển trang, tránh kẹt overlay che mất nội dung trang mới.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    window.location.href = `/tim-kiem?q=${encodeURIComponent(q)}`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-silk ${
        scrolled
          ? "bg-daoBlack/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          : "bg-daoDark2/70 backdrop-blur-sm"
      }`}
      onMouseLeave={() => setMegaSlug(null)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
        {/* Layout dạng lưới 3 cột trên mobile: [Menu] [Logo giữa] [Tìm kiếm+Giỏ hàng] —
            đảm bảo logo luôn ở giữa và 2 nhóm icon luôn ở đúng 2 bên, không phụ
            thuộc độ dài chữ như cách canh giữa bằng absolute trước đây. */}
        <div
          className={`grid grid-cols-[auto_1fr_auto] lg:flex lg:items-center lg:justify-between items-center transition-[height] duration-300 ease-silk ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Menu (mobile) — góc trên bên trái, bấm vào hiện danh mục sản phẩm */}
          <button
            aria-label="Danh mục sản phẩm"
            className="lg:hidden text-daoWhite justify-self-start"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Logo — "DAO" serif đỏ thẫm + "PHÚC SEN" sans-serif, luôn ở giữa trên mobile */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 justify-self-center lg:justify-self-auto"
          >
            <Image
              src="/images/brand/logo.png"
              alt="Dao Phúc Sen"
              width={34}
              height={34}
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0"
            />
            <span className="hidden sm:block w-px h-3.5 bg-daoWine/25" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-base sm:text-xl leading-none text-daoWineLight tracking-wide whitespace-nowrap">
                DAO PHÚC SEN
              </span>
              <span className="hidden sm:block text-[9px] font-medium tracking-[0.15em] uppercase text-daoSilver mt-1 whitespace-nowrap">
                Dao rèn thủ công Cao Bằng
              </span>
            </span>
          </Link>

          {/* Center nav (desktop) — chữ nhỏ + nowrap để không bị vỡ thành 2 dòng khi có nhiều mục */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setMegaSlug(item.megaSlug ?? null)}
                >
                  <Link
                    href={item.href}
                    className={`nav-link whitespace-nowrap text-[11px] xl:text-xs tracking-[0.06em] uppercase font-body transition-colors duration-200 ${
                      active
                        ? "is-active font-semibold text-daoWhite"
                        : "font-medium text-daoSilverLight hover:text-daoWhite"
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right icons — trên mobile chỉ Tìm kiếm + Giỏ hàng (góc trên bên phải);
              Tài khoản/Yêu thích chỉ hiện trên desktop để đỡ chật chội. */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-7 shrink-0 justify-self-end">
            <button
              aria-label="Tìm kiếm"
              onClick={() => setSearchOpen(true)}
              className="text-daoWhite hover:text-daoWineLight hover:scale-110 transition-all duration-200"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Tài khoản"
              className="hidden lg:inline-flex text-daoWhite hover:text-daoWineLight hover:scale-110 transition-all duration-200"
            >
              <User size={19} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Yêu thích"
              className="hidden lg:inline-flex text-daoWhite hover:text-daoWineLight hover:scale-110 transition-all duration-200"
            >
              <Heart size={19} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Giỏ hàng"
              onClick={openCart}
              className="relative text-daoWhite hover:text-daoWineLight hover:scale-110 transition-all duration-200"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-daoWine text-[10px] text-white">
                  {totalQuantity > 9 ? "9+" : totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu (desktop) */}
      <AnimatePresence>
        {megaSlug && megaData[megaSlug] && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="hidden lg:block absolute left-0 right-0 top-full bg-daoDark2 border-t border-daoBorder shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            onMouseEnter={() => setMegaSlug(megaSlug)}
          >
            <div className="mx-auto max-w-7xl px-8 py-8 grid grid-cols-[220px_1fr] gap-10">
              <Link
                href={`/danh-muc/${megaData[megaSlug].slug}`}
                className="group relative rounded-soft overflow-hidden bg-daoDark"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={megaData[megaSlug].image}
                    alt={megaData[megaSlug].name}
                    fill
                    sizes="220px"
                    className="object-cover transition-transform duration-700 ease-silk group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <span className="text-white text-sm flex items-center gap-1">
                    Xem tất cả {megaData[megaSlug].name}
                    <ChevronRight size={14} />
                  </span>
                </div>
              </Link>

              <div className="grid grid-cols-4 gap-6">
                {megaData[megaSlug].products.map((p) => (
                  <Link key={p.id} href={`/san-pham/${p.id}`} className="group block">
                    <div className="relative aspect-square rounded-soft overflow-hidden bg-daoDark mb-2.5">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="140px"
                        className="object-cover transition-transform duration-500 ease-silk group-hover:scale-105"
                      />
                    </div>
                    <p className="text-xs text-daoWhite line-clamp-1 group-hover:text-daoWineLight transition-colors">
                      {p.name}
                    </p>
                    <p className="font-price text-xs font-semibold text-daoWineLight mt-0.5">
                      {formatVND(p.salePrice ?? p.price)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay tìm kiếm — bấm icon kính lúp để mở */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[110]"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 left-0 right-0 z-[120] bg-daoDark2 shadow-[0_18px_50px_rgba(0,0,0,.55)]"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="mx-auto max-w-3xl px-5 py-6 flex items-center gap-3"
              >
                <Search size={20} className="text-daoSilver shrink-0" strokeWidth={1.5} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm dao chặt, dao thái, đá mài..."
                  className="flex-1 border-b border-daoBorder focus:border-daoWine outline-none py-2 text-base bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Đóng"
                  className="text-daoWhite hover:text-daoWineLight shrink-0"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile drawer — trượt từ trái, mở bằng nút 3 vạch góc trên bên trái —
          hiện danh mục sản phẩm trước tiên */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/40 z-[90] lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 w-[82%] max-w-xs bg-daoDark2 z-[95] lg:hidden flex flex-col h-screen"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-daoBorder shrink-0">
                <span className="font-display text-lg text-daoWineLight">DAO PHÚC SEN</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Đóng menu"
                  className="text-daoWhite hover:text-daoWineLight transition-colors"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2 min-h-0">
                <p className="px-6 pt-3 pb-1 text-[11px] uppercase tracking-widest2 text-daoWineLight">
                  Danh mục sản phẩm
                </p>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/danh-muc/${c.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 border-b border-daoBorder transition-colors ${
                      isActive(`/danh-muc/${c.slug}`) ? "bg-daoDark" : ""
                    }`}
                  >
                    <span className="relative h-10 w-10 rounded-soft overflow-hidden bg-daoDark shrink-0">
                      <Image src={c.image} alt={c.name} fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="flex-1 text-sm text-daoWhite">{c.name}</span>
                    <ChevronRight size={15} className="text-daoSilver" />
                  </Link>
                ))}

                <p className="px-6 pt-4 pb-1 text-[11px] uppercase tracking-widest2 text-daoWineLight">
                  Khác
                </p>
                {OTHER_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-6 py-3.5 text-sm tracking-[0.08em] uppercase border-b border-daoBorder transition-colors ${
                      isActive(item.href) ? "text-daoWhite font-semibold" : "text-daoSilver"
                    }`}
                  >
                    {item.label}
                    <ChevronRight size={15} className="text-daoSilver" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-6 px-6 py-5 border-t border-daoBorder shrink-0">
                <button aria-label="Tài khoản" className="text-daoWhite">
                  <User size={19} strokeWidth={1.5} />
                </button>
                <button aria-label="Yêu thích" className="text-daoWhite">
                  <Heart size={19} strokeWidth={1.5} />
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
