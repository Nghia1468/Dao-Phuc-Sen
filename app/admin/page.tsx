import { Eye, TrendingUp, Package, AlertCircle, ShoppingBag, Wallet, Award } from "lucide-react";
import { getViewStats } from "@/lib/analytics";
import { getCatalog } from "@/lib/catalog";
import { formatVND } from "@/lib/data";
import { isSheetsConfigured, readOrders } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, catalog] = await Promise.all([getViewStats(), getCatalog()]);
  const orders = isSheetsConfigured() ? await readOrders().catch(() => []) : [];

  const totalProducts = catalog.length;
  const totalOrders = orders.length;
  const revenue = orders
    .filter((o) => o.status !== "Đã hủy")
    .reduce((sum, o) => sum + o.total, 0);
  const bestSeller = [...catalog].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))[0];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Dashboard</h1>

      {!stats.configured && (
        <div className="flex items-start gap-3 bg-white border border-blush rounded-softLg p-5 mb-6">
          <AlertCircle size={18} className="text-clayDark shrink-0 mt-0.5" />
          <p className="text-sm text-inkLight">
            Chưa cấu hình Google Sheets nên số liệu đơn hàng/doanh thu tạm hiển thị bằng 0. Điền{" "}
            <code className="bg-sand px-1.5 py-0.5 rounded">.env.local</code>{" "}
            rồi xem hướng dẫn trong HUONG_DAN_QUAN_LY_SAN_PHAM.md để bắt đầu theo dõi.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <div className="bg-white rounded-softLg p-5 shadow-whisper">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-blush flex items-center justify-center">
              <Package size={16} className="text-clayDark" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-inkLight">Tổng sản phẩm</p>
          </div>
          <p className="font-display text-2xl sm:text-3xl text-ink">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-softLg p-5 shadow-whisper">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-blush flex items-center justify-center">
              <ShoppingBag size={16} className="text-clayDark" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-inkLight">Tổng đơn hàng</p>
          </div>
          <p className="font-display text-2xl sm:text-3xl text-ink">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-softLg p-5 shadow-whisper">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-blush flex items-center justify-center">
              <Wallet size={16} className="text-clayDark" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-inkLight">Doanh thu (trừ đơn hủy)</p>
          </div>
          <p className="font-display text-xl sm:text-2xl text-ink">{formatVND(revenue)}</p>
        </div>
        <div className="bg-white rounded-softLg p-5 shadow-whisper">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-blush flex items-center justify-center">
              <Award size={16} className="text-clayDark" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-inkLight">Sản phẩm bán chạy nhất</p>
          </div>
          <p className="font-display text-base sm:text-lg text-ink line-clamp-1">
            {bestSeller?.name ?? "Chưa có dữ liệu"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-softLg p-5 shadow-whisper">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-blush flex items-center justify-center">
              <Eye size={16} className="text-clayDark" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-inkLight">Tổng lượt xem sản phẩm</p>
          </div>
          <p className="font-display text-3xl text-ink">{stats.totalViews}</p>
        </div>
        <div className="bg-white rounded-softLg p-5 shadow-whisper">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-blush flex items-center justify-center">
              <TrendingUp size={16} className="text-clayDark" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-inkLight">Sản phẩm được xem nhiều nhất</p>
          </div>
          <p className="font-display text-lg text-ink line-clamp-1">
            {stats.topProducts[0]?.productName ?? "Chưa có dữ liệu"}
          </p>
        </div>
        <div className="bg-white rounded-softLg p-5 shadow-whisper">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-blush flex items-center justify-center">
              <Package size={16} className="text-clayDark" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-inkLight">Số sản phẩm đã có lượt xem</p>
          </div>
          <p className="font-display text-3xl text-ink">{stats.topProducts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* top viewed */}
        <div className="bg-white rounded-softLg p-6 shadow-whisper">
          <h2 className="font-display text-lg text-ink mb-4">
            Top sản phẩm được xem nhiều nhất
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-inkLight">Chưa có lượt xem nào.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-6 w-6 rounded-full bg-sand text-xs flex items-center justify-center text-inkLight shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-ink line-clamp-1">{p.productName || p.productId}</p>
                      <p className="text-xs text-inkLight">{p.category}</p>
                    </div>
                  </div>
                  <span className="text-clayDark font-medium shrink-0 ml-3">
                    {p.count} lượt
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* recent activity */}
        <div className="bg-white rounded-softLg p-6 shadow-whisper">
          <h2 className="font-display text-lg text-ink mb-4">
            Hoạt động xem gần đây
          </h2>
          {stats.recentViews.length === 0 ? (
            <p className="text-sm text-inkLight">Chưa có hoạt động nào.</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {stats.recentViews.map((v, i) => (
                <li key={i} className="flex items-center justify-between text-sm border-b border-blush/50 pb-2 last:border-0">
                  <div className="min-w-0">
                    <p className="text-ink line-clamp-1">{v.productName || v.productId}</p>
                    <p className="text-xs text-inkLight">{v.category}</p>
                  </div>
                  <span className="text-xs text-inkLight shrink-0 ml-3">
                    {v.viewedAt}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
