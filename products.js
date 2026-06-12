/* ============================================================
   products.js — Dữ liệu sản phẩm Dao Phúc Sen
   Để thêm sản phẩm: thêm object vào items[]
   Để thêm danh mục: thêm key mới vào PRODUCTS
   ============================================================ */

const PRODUCTS = {

  "dao-chat": {
    label: "Dao Chặt",
    icon:  "bi-lightning-charge",
    items: [
      {
        id:   "dc-ga",
        name: "Dao Chặt Gà",
        desc: `Lưỡi dao: 22–23 cm<br>
        Bản rộng: 8–8.5 cm<br>
        Độ dày: 3 cm<br>
        Cán: 12-13 cm<br>
        Trọng lượng: 500–600 gram <br>
        Chất liệu: 100% nhíp đỏ Nga`,
        img:  "Image/Chat Thai Ga Vit.jpg",
        id:   "dc-ga",
        badge: "Bán chạy",
        rating:      4.9,   // ← THÊM
        reviewCount: 128,   // ← THÊM
        soldCount:   2240,  // ← THÊM
        variants: {
          "can-sat": { price: 330000, label: "Cán Sắt" },
          "can-go":  { price: 360000, label: "Cán Gỗ"  }
        }
      },
      {
        id:   "dc-xuong",
        name: "Dao Chặt Xương",
        desc: `Lưỡi dao: 22 -23 cm cm<br>
              Bản rộng: 8 - 8.5 cm <br>
              Dày: 5 li, cán:12-13cm <br>
              Cán: 13 cm<br>
              Nặng: 700-800 gram <br>
              Chất liệu: 100% nhíp đỏ Nga`,
        img:  "Image/Dao Chat Xuong Ong - Chan Gio.jpg",
        rating:      4.2,   // ← THÊM
        reviewCount: 68,   // ← THÊM
        soldCount:   1463,  // ← THÊM
        variants: {
          "can-sat": { price: 380000, label: "Cán Sắt" },
          "can-go":  { price: 410000, label: "Cán Gỗ"  }
        }
      },
      /*{
        id:   "dt-thit",
        name: "Dao thai thịt",
        desc: "Lưỡi dao: 22 -23 cm, bản rộng: 8 - 8.5 cm, dày: 3 li, cán:13cm, nặng: 500-600 gram, chất liệu: 100% nhíp đỏ Nga",
        img:  "Image/dao thai thit.jpg",
        rating:      4.6,   // ← THÊM
        reviewCount: 146,   // ← THÊM
        soldCount:   1240,  // ← THÊM
        variants: {
          "can-sat": { price: 285000, label: "Cán Sắt" },
          "can-go":  { price: 300000, label: "Cán Gỗ"  }
        }
      }*/
    ]
  },

  "dao-bau": {
    label: "Dao Bầu",
    icon:  "bi-scissors",
    items: [
      {
        id:   "db-nho",
        name: "Dao Bầu Lọc Thái",
        desc: `Lưỡi dao: 21 - 22 cm <br>
              Bản rộng: 6.5 - 7 cm <br>
              Độ dày: 1,6 li <br>
              Cán: 12cm - 13cm <br>
              Nặng: 250-350 gr <br>
              Chất liệu: 100% nhíp đỏ Nga`,
        img:  "Image/Bau Loc Thai (2).jpg",
        rating:      4.4,   // ← THÊM
        reviewCount: 156,   // ← THÊM
        soldCount:   2530,  // ← THÊM
        variants: {
          "can-sat": { price: 265000,  label: "Cán Sắt" },
          "can-go":  { price: 285000, label: "Cán Gỗ"  }
        }
      },
      {
        id:   "db-gavit",
        name: "Dao bầu lọc gà/vịt",
        desc: `Lưỡi dao: 11-12 cm  <br>
              Bản rộng: 3,5 cm <br>
              Độ dày: 1.6li <br>
              Cán: 12-13cm <br>
              Nặng: 200-300 gr <br>
              Chất liệu: 100% nhíp đỏ Nga`,
        img:  "Image/Loc Ga Vit 1.jpg",
        rating:      4.3,   // ← THÊM
        reviewCount: 46,   // ← THÊM
        soldCount:   1170,  // ← THÊM
        variants: {
          "can-sat": { price: 265000, label: "Cán Sắt" },
          "can-go":  { price: 385000, label: "Cán Gỗ"  }
        }
      },
      /*{
        id:   "db-lon",
        name: "Dao Bầu Lớn",
        desc: "Lưỡi dao: 21 -22 cm, bản rộng: 6.5 - 7 cm, dày: 1,8 li, cán:12cm, nặng: 500-600 gram, chất liệu: 100% nhíp đỏ Nga",
        img:  "Image/Dao Got Cu Qua.jpg",
        rating:      4.7,   // ← THÊM
        reviewCount: 164,   // ← THÊM
        soldCount:   1560,  // ← THÊM
        variants: {
          "can-sat": { price: 200000, label: "Cán Sắt" },
          "can-go":  { price: 230000, label: "Cán Gỗ"  }
        }
      }*/
    ]
  },

  "dao-thai": {
    label: "Dao Thái",
    icon:  "bi-crop",
    items: [
      {
        id:   "dt-thit",
        name: "Dao Thái Thịt",
        desc: `Lưỡi dao: 20 - 21 cm <br>
              Bản rộng: 6,5 - 7 cm <br>
              Độ dày: 1,6 li <br>
              Cán: 12cm - 13cm <br>
              Nặng: 250-300 gr <br>
              Chất liệu: 100% nhíp đỏ Nga`,
        img:  "Image/dao thai thit.jpg",
        rating:      4.4,   // ← THÊM
        reviewCount: 189,   // ← THÊM
        soldCount:   2350,  // ← THÊM
        variants: {
          "can-sat": { price: 285000, label: "Cán Sắt" },
          "can-go":  { price: 300000, label: "Cán Gỗ"  }
        }
      },

      {
        id:   "dt-ga",
        name: "Dao gọt củ quả",
        desc: `Lưỡi dao: 16 -17 cm <br>
              Bản rộng: 3,5 - 4 cm <br>
              Độ dày: 1,6 li <br>
              Cán: 12cm - 13cm <br>
              Nặng: 200-300 gr <br>
              Chất liệu: 100% nhíp đỏ Nga`,
        img:  "Image/Dao Got Cu Qua.jpg",
        rating:      4.7,   // ← THÊM
        reviewCount: 164,   // ← THÊM
        soldCount:   1560,  // ← THÊM
        variants: {
          "can-sat": { price: 200000, label: "Cán Sắt" },
          "can-go":  { price: 230000, label: "Cán Gỗ"  }
        }
      },
      /*
      {
        id:   "dt-lon",
        name: "Dao Thái Lớn",
        desc: "Lưỡi dao: 22 -23 cm, bản rộng: 8 - 8.5 cm, dày: 3 li, cán:13cm, nặng: 500-600 gram, chất liệu: 100% nhíp đỏ Nga",
        img:  "Image/dao thai ga.jpg",
        badge: "Pro",
        variants: {
          "can-sat": { price: 329000, label: "Cán Sắt" },
          "can-go":  { price: 359000, label: "Cán Gỗ"  }
        }
      }*/
    ]
  },

  "combo": {
    label: "Combo",
    icon:  "bi-box-seam",
    items: [
      {
        id:   "cb-3dao",
        name: "Combo 3 Dao",
        desc: `Dao chặt gà/vịt <br>
              Chuyên thái và bầu lọc <br>
              Tiết kiệm 15%.`,
        img:  "Image/combo 3 dao bep sat.jpg",
        badge: "Tiết kiệm 15%",
        rating:      4.4,   // ← THÊM
        reviewCount: 49,   // ← THÊM
        soldCount:   894,  // ← THÊM
        variants: {
          "can-sat": { price: 840000, label: "Cán Sắt" },
          "can-go":  { price: 940000, label: "Cán Gỗ"  }
        }
      },
      {
        id:   "cb-5dao",
        name: "Combo 5 Dao",
        desc: `Bộ dao đầy đủ: Dao bầu lọc, gọt củ quả, chuyên thái, chặt gà, chặt xương <br>
              Tiết kiệm 15%.`,
        img:  "Image/combo 5 dao bep sat.jpg",
        badge: "Tiết kiệm 18%",
        rating:      4.6,   // ← THÊM
        reviewCount: 34,   // ← THÊM
        soldCount:   562,  // ← THÊM
        variants: {
          "can-sat": { price: 1300000, label: "Cán Sắt" },
          "can-go":  { price: 1450000, label: "Cán Gỗ"  }
        }
      }
    ]
  }
};

const CATEGORY_ORDER = ["dao-chat", "dao-bau", "dao-thai", "combo"];

/* Slideshow hero — mỗi slide ứng với 1 sản phẩm/chủ đề */
const HERO_SLIDES = [
  {
    img:      "Image/anh bia.jpg",
    title:    "Dao Chặt Gà",
    subtitle: "Tinh hoa rèn thủ công làng nghề Phúc Sen — Dùng trong bếp gia đình và chế biến thực phẩm"
  },
  {
    img:      "Image/anh nen.jpg",
    title:    "Dao Chặt Xương",
    subtitle: "Thép dày rèn thủ công — Dùng cho chế biến xương heo bò trong bếp"
  },
  {
    img:      "Image/anh bia 1.jpg",
    title:    "Dao Bầu Cao Cấp",
    subtitle: "Cán gỗ chắc tay — Lưỡi thép rèn thủ công bền đẹp theo năm tháng"
  },
  {
    img:      "Image/anh bia 2.jpg",
    title:    "Dao Thái Thịt",
    subtitle: "Lưỡi mỏng rèn tay — Thái thịt sống chín mỏng đều, tiện lợi mỗi bữa cơm"
  },
  {
    img:      "Image/anh bia 3.jpg",
    title:    "Dao Thái Lớn",
    subtitle: "Dao thủ công làng nghề Phúc Sen — Phù hợp chế biến thực phẩm gia đình và kinh doanh ăn uống"
  }
];

/* Quy tắc ship */
const SHIP_CONFIG = {
  freeThreshold: 500000,
  shipFee:       30000
};
