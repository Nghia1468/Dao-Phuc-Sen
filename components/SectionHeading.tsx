"use client";

import { motion } from "framer-motion";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  variant = "default",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** "onWine": dùng khi section có nền đỏ rượu (vd. khối Flash Sale) để chữ đủ tương phản. */
  variant?: "default" | "onWine";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="text-center max-w-xl mx-auto mb-12"
    >
      <p
        className={`uppercase tracking-widest2 text-xs mb-3 ${
          variant === "onWine" ? "text-daoGoldLight" : "text-daoWineLight"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl md:text-4xl text-daoWhite">{title}</h2>
      {description && (
        <p
          className={`mt-3 text-sm font-light ${
            variant === "onWine" ? "text-white/70" : "text-daoSilver"
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
