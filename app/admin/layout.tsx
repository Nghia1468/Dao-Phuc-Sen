"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Ticket,
  Star,
  FileText,
  LogOut,
  ClipboardList,
  Users,
  Image as ImageIcon,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: ClipboardList },
  { href: "/admin/khach-hang", label: "Khách hàng", icon: Users },
  { href: "/admin/banner", label: "Banner", icon: ImageIcon },
  { href: "/admin/ma-giam-gia", label: "Mã giảm giá", icon: Ticket },
  { href: "/admin/danh-gia", label: "Đánh giá", icon: Star },
  { href: "/admin/bai-viet", label: "Bài viết", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  // Trang đăng nhập hiển thị độc lập, không có sidebar/header quản trị.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-sand/30 flex">
      <aside className="w-56 bg-white border-r border-blush shrink-0 hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-6 border-b border-blush">
          <p className="font-display text-xl text-primary">
            DAO PHÚC SEN <span className="text-inkLight font-body text-sm font-normal lowercase">admin</span>
          </p>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-soft text-sm transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "text-ink hover:bg-sand"
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-blush">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-soft text-sm text-ink hover:bg-sand transition-colors"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* thanh trên cùng cho mobile (không có sidebar) */}
        <header className="md:hidden bg-white border-b border-blush sticky top-0 z-10">
          <div className="px-5 h-14 flex items-center justify-between">
            <p className="font-display text-lg text-primary">
              DAO PHÚC SEN <span className="text-inkLight font-body text-xs font-normal lowercase">admin</span>
            </p>
            <button
              onClick={handleLogout}
              className="text-xs text-ink hover:text-clayDark"
            >
              Đăng xuất
            </button>
          </div>
          <nav className="flex gap-4 px-5 pb-3 text-xs">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "text-clayDark"
                    : "text-inkLight"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
