const STATS = [
  { value: "30+", label: "Năm kinh nghiệm" },
  { value: "10K+", label: "Đơn hàng" },
  { value: "14+", label: "Loại sản phẩm" },
  { value: "63", label: "Tỉnh giao hàng" },
];

export default function StatsBar() {
  return (
    <section className="bg-daoDark2 border-y border-daoBorder">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-sans text-4xl md:text-5xl text-white">{s.value}</p>
            <p className="mt-2 text-sm text-white/80 normal-case tracking-normal font-normal">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
