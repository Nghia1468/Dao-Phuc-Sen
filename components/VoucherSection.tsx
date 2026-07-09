"use client";

import { useState } from "react";
import { Ticket, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { Voucher } from "@/lib/data";

export default function VoucherSection({ vouchers }: { vouchers: Voucher[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // clipboard not available — silently ignore
    }
  };

  return (
    <section className="py-16 px-5 md:px-8 bg-daoDark3/60">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {vouchers.map((v, i) => (
            <motion.div
              key={v.code}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-center justify-between gap-4 bg-daoDark2 rounded-soft p-5 shadow-[0_8px_24px_rgba(0,0,0,.45)]"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-daoDark3 flex items-center justify-center shrink-0">
                  <Ticket size={18} className="text-daoWineLight" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-display text-lg tracking-wide text-daoWhite">
                    {v.code}
                  </p>
                  <p className="text-xs text-daoSilver">{v.label}</p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(v.code)}
                className="shrink-0 flex items-center gap-1.5 text-xs px-4 py-2 rounded-soft border border-daoWine text-daoWineLight hover:bg-daoWine hover:text-white transition-colors duration-300"
              >
                {copied === v.code ? (
                  <>
                    <Check size={13} /> Đã sao chép
                  </>
                ) : (
                  "Sao chép"
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
