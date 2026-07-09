"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <section className="pt-40 pb-24 px-5 md:px-8">
      <div className="mx-auto max-w-lg text-center">
        <div className="h-16 w-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-clayDark" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-3xl text-ink mb-3">
          Đặt hàng thành công!
        </h1>
        <p className="text-sm text-inkLight font-light mb-1">
          Cảm ơn bạn đã mua sắm cùng MAI. Đơn hàng của bạn đang được xử lý.
        </p>
        {orderId && (
          <p className="text-sm text-ink mt-4">
            Mã đơn hàng:{" "}
            <span className="font-semibold text-clayDark">{orderId}</span>
          </p>
        )}
        <p className="text-xs text-inkLight mt-6">
          Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
        </p>
        <Link
          href="/"
          className="inline-block mt-10 px-8 py-3.5 bg-ink text-white text-sm tracking-wide rounded-soft hover:bg-clayDark transition-colors duration-300"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
