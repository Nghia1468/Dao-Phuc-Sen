import { Facebook, MapPin, Mail, Phone, Clock } from "lucide-react";
import { SITE } from "@/lib/seo";

export default function Footer() {
  return (
    <footer className="bg-daoDark2 border-t border-daoBorder">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-xl text-daoWineLight mb-1">DAO PHÚC SEN</p>
          <p className="text-xs uppercase tracking-widest2 text-daoWineLight mb-3">
            Dao rèn thủ công Cao Bằng
          </p>
          <p className="text-sm text-daoSilver font-light leading-relaxed">
            Làng nghề rèn dao thủ công truyền thống hơn 300 năm — thép nhíp đỏ Nga, bền sắc, rèn tay bởi nghệ nhân Phúc Sen.
          </p>
          <div className="flex gap-3 mt-5">
            <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-9 w-9 flex items-center justify-center rounded-full bg-daoDark text-daoWhite hover:bg-daoWine hover:text-white transition-colors">
              <Facebook size={16} strokeWidth={1.5} />
            </a>
            <a href={SITE.social.zalo} target="_blank" rel="noopener noreferrer" aria-label="Zalo" className="h-9 w-9 flex items-center justify-center rounded-full bg-daoDark text-daoWhite hover:bg-daoWine hover:text-white transition-colors text-[11px] font-semibold">
              Zalo
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest2 text-daoWineLight mb-4">Giới thiệu</p>
          <ul className="space-y-2.5 text-sm text-daoSilver font-light">
            <li><a href="#" className="hover:text-daoWineLight transition-colors">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-daoWineLight transition-colors">Liên hệ</a></li>
            <li><a href="#" className="hover:text-daoWineLight transition-colors">Chính sách</a></li>
            <li><a href="/gioi-thieu" className="hover:text-daoWineLight transition-colors">Giới thiệu</a></li>
            <li><a href="/faq" className="hover:text-daoWineLight transition-colors">Câu hỏi thường gặp</a></li>
            <li><a href="/blog" className="hover:text-daoWineLight transition-colors">Blog</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest2 text-daoWineLight mb-4">Hỗ trợ khách hàng</p>
          <ul className="space-y-2.5 text-sm text-daoSilver font-light">
            <li><a href="#" className="hover:text-daoWineLight transition-colors">Hướng dẫn mua hàng</a></li>
            <li><a href="#" className="hover:text-daoWineLight transition-colors">Chính sách đổi trả</a></li>
            <li><a href="#" className="hover:text-daoWineLight transition-colors">Vận chuyển</a></li>
            <li><a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-daoWineLight transition-colors">Fanpage</a></li>
          </ul>
        </div>

        {/* Thông tin liên hệ — đồng bộ với Google Business Profile (lib/seo.ts) */}
        <div>
          <p className="text-xs uppercase tracking-widest2 text-daoWineLight mb-4">Liên hệ</p>
          <ul className="space-y-3 text-sm text-daoSilver font-light">
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-daoWineLight" strokeWidth={1.5} />
              <span>
                {SITE.address.streetAddress}, {SITE.address.addressLocality},{" "}
                {SITE.address.addressRegion}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-daoWineLight" strokeWidth={1.5} />
              <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-daoWineLight" strokeWidth={1.5} />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={15} className="mt-0.5 shrink-0 text-daoWineLight" strokeWidth={1.5} />
              <span>
                T2–T6: {SITE.openingHours[0].opens}–{SITE.openingHours[0].closes}
                <br />
                T7–CN: {SITE.openingHours[1].opens}–{SITE.openingHours[1].closes}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="seam" />

      <div className="text-center py-6 text-xs text-daoSilver font-light">
        © {new Date().getFullYear()} Dao Phúc Sen — Làng nghề rèn Cao Bằng. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
