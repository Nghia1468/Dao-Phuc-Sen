// ---------------------------------------------------------------------------
// Blog — tăng SEO bằng nội dung hữu ích (cách chọn trang sức, ý nghĩa đá
// phong thuỷ, bảo quản...). Quản lý qua Google Sheet "Posts" + trang Admin
// /admin/bai-viet. Nội dung viết dạng Markdown, render bằng thư viện `marked`.
// ---------------------------------------------------------------------------

import {
  isSheetsConfigured,
  readPosts as readPostsSheet,
  type SheetPost,
} from "./googleSheets";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  status: "Published" | "Draft";
}

const IMG_CHON_DAO = "/images/products/dao-chat-ga.jpg";
const IMG_MAI_DAO = "/images/brand/bg-forge.jpg";
const IMG_BAO_QUAN = "/images/products/dao-thai-thit.jpg";
const IMG_LANG_NGHE = "/images/brand/hero-1.jpg";

// 4 bài viết đúng chủ đề yêu cầu: cách chọn dao, cách mài dao, bảo quản dao,
// giới thiệu làng rèn Phúc Sen — để mục Blog không trống khi chưa cấu hình
// Google Sheets.
const MOCK_POSTS: Post[] = [
  {
    slug: "cach-chon-dao-phu-hop",
    title: "Cách chọn dao bếp phù hợp với nhu cầu sử dụng",
    excerpt:
      "Mỗi loại dao Phúc Sen sinh ra cho một công việc riêng — chọn đúng loại giúp chế biến nhanh, đỡ tốn sức và dao bền lâu hơn.",
    content:
      "## Xác định công việc chính trong bếp\n\nNếu thường xuyên chặt gà, vịt, xương nhỏ — nên chọn **Dao chặt**. Nếu chủ yếu thái thịt, rau củ mỏng đều — **Dao thái** sẽ phù hợp hơn. Với các thao tác lọc thịt, lọc cá, phi lê — **Dao bầu** hoặc **Dao lọc** chuyên dụng sẽ cho đường cắt gọn, ít hao thịt.\n\n## Chọn theo tần suất sử dụng\n\nGia đình dùng hằng ngày với nhiều loại nguyên liệu khác nhau nên cân nhắc mua **Combo 3 dao** hoặc **Combo 5 dao** để có đủ bộ dùng, giá tiết kiệm hơn mua lẻ 15–18%.\n\n## Cán sắt hay cán gỗ?\n\nCán sắt bền, chắc, không sợ mối mọt — hợp với bếp dùng tần suất cao. Cán gỗ nghiến nhẹ tay, đẹp mắt, hợp với ai thích cảm giác cầm truyền thống. Cả hai đều dùng chung lưỡi thép nhíp đỏ Nga như nhau, chỉ khác phần cán.\n\n## Đừng quên đá mài\n\nDù chọn loại dao nào, một viên **đá mài** tốt sẽ giúp dao luôn bén như mới sau thời gian dài sử dụng.",
    coverImage: IMG_CHON_DAO,
    author: "Dao Phúc Sen",
    publishedAt: "2026-05-05",
    status: "Published",
  },
  {
    slug: "cach-mai-dao-dung-ky-thuat",
    title: "Cách mài dao đúng kỹ thuật để giữ độ bén lâu dài",
    excerpt:
      "Dao rèn thủ công chỉ thực sự phát huy hết công dụng khi được mài đúng góc, đúng lực. Vài bước cơ bản ai cũng làm được tại nhà.",
    content:
      "## Chuẩn bị đá mài\n\nDùng đá mài 2 mặt: mặt thô (mài dao cùn, sứt mẻ nhẹ) và mặt mịn (lên nước bén hoàn thiện). Ngâm đá mài trong nước sạch khoảng 10 phút trước khi dùng.\n\n## Xác định góc mài\n\nGiữ lưỡi dao nghiêng khoảng 15–20 độ so với mặt đá — góc càng nhỏ dao càng bén nhưng dễ mẻ hơn, góc lớn hơn dao bền hơn nhưng kém bén hơn một chút.\n\n## Các bước mài\n\n1. Đặt lưỡi dao lên mặt thô, kéo đều tay từ chuôi ra mũi dao, lặp lại 10–15 lần mỗi mặt.\n2. Đổi sang mặt mịn, thực hiện tương tự để lên nước bén.\n3. Rửa sạch dao, lau khô, thử độ bén bằng cách cắt nhẹ qua giấy hoặc cà chua.\n\n## Lưu ý an toàn\n\nLuôn mài với lực đều tay, không ấn quá mạnh, và giữ tay còn lại cách xa lưỡi dao trong suốt quá trình mài.",
    coverImage: IMG_MAI_DAO,
    author: "Dao Phúc Sen",
    publishedAt: "2026-05-14",
    status: "Published",
  },
  {
    slug: "cach-bao-quan-dao",
    title: "Cách bảo quản dao rèn thủ công bền đẹp theo năm tháng",
    excerpt:
      "Thép nhíp đỏ Nga bền và ít gỉ, nhưng vẫn cần bảo quản đúng cách để dao luôn bén và không xuống màu theo thời gian.",
    content:
      "## Lau khô sau khi rửa\n\nSau khi rửa dao, luôn lau khô ngay bằng khăn mềm, tránh để dao ướt tiếp xúc không khí lâu — đặc biệt quan trọng với dao cán sắt.\n\n## Bảo quản đúng nơi\n\nCắm dao vào khối gỗ hoặc treo trên thanh nam châm, tránh để lẫn trong ngăn kéo cùng các vật dụng kim loại khác dễ làm mẻ lưỡi.\n\n## Với dao cán gỗ\n\nThỉnh thoảng lau cán gỗ bằng dầu ăn hoặc dầu chuyên dụng để gỗ không bị khô, nứt theo thời gian.\n\n## Mài lại định kỳ\n\nMài lại dao mỗi 2–4 tuần tùy tần suất sử dụng để dao luôn giữ được độ bén như lúc mới mua — xem chi tiết ở bài viết \"Cách mài dao đúng kỹ thuật\".",
    coverImage: IMG_BAO_QUAN,
    author: "Dao Phúc Sen",
    publishedAt: "2026-05-22",
    status: "Published",
  },
  {
    slug: "gioi-thieu-lang-ren-phuc-sen",
    title: "Giới thiệu làng rèn Phúc Sen — hơn 300 năm giữ lửa nghề",
    excerpt:
      "Nằm tại xã Phúc Sen, huyện Quảng Uyên, Cao Bằng, làng rèn Phúc Sen là một trong những làng nghề rèn thủ công lâu đời và nổi tiếng nhất Việt Nam.",
    content:
      "## Lịch sử làng nghề\n\nLàng rèn Phúc Sen hình thành và phát triển hơn 300 năm, gắn liền với cộng đồng người Nùng An sinh sống tại xã Phúc Sen, huyện Quảng Uyên, tỉnh Cao Bằng. Nghề rèn được truyền từ đời này qua đời khác, trở thành sinh kế chính của nhiều hộ gia đình trong làng.\n\n## Nghệ nhân và quy trình rèn\n\nMỗi con dao được rèn hoàn toàn thủ công qua nhiều công đoạn: nung thép, rèn tạo hình, tôi thép, mài dũa và lắp cán. Nguyên liệu chủ yếu là thép nhíp ô tô đã qua sử dụng (thường gọi là \"nhíp đỏ Nga\") được tái rèn, tạo nên độ cứng và độ bén đặc trưng khó nơi nào sánh được.\n\n## Sản phẩm và thị trường\n\nTừ dao chặt, dao thái, dao bầu đến các sản phẩm nông cụ, dao Phúc Sen được ưa chuộng khắp cả nước nhờ độ bền, độ sắc bén và giá thành hợp lý so với chất lượng. Ngày nay, làng nghề vẫn tiếp tục gìn giữ kỹ thuật rèn truyền thống trong khi từng bước đưa sản phẩm đến gần hơn với người tiêu dùng qua các kênh bán hàng hiện đại.",
    coverImage: IMG_LANG_NGHE,
    author: "Dao Phúc Sen",
    publishedAt: "2026-06-01",
    status: "Published",
  },
];

function sheetToPost(p: SheetPost): Post {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    author: p.author,
    publishedAt: p.publishedAt,
    status: p.status,
  };
}

let cache: { data: Post[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function getAllPostsRaw(): Promise<Post[]> {
  if (!isSheetsConfigured()) return MOCK_POSTS;
  if (cache && cache.expiresAt > Date.now()) return cache.data;
  try {
    const rows = await readPostsSheet();
    const mapped = rows.map(sheetToPost);
    cache = { data: mapped, expiresAt: Date.now() + CACHE_TTL_MS };
    return mapped;
  } catch (err) {
    console.error("[blog] Không đọc được Google Sheets:", err);
    return MOCK_POSTS;
  }
}

export function invalidateBlogCache(): void {
  cache = null;
}

/** Bài viết đã xuất bản — dùng cho trang /blog công khai, mới nhất trước. */
export async function getPublishedPosts(): Promise<Post[]> {
  const all = await getAllPostsRaw();
  return all
    .filter((p) => p.status === "Published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const all = await getAllPostsRaw();
  return all.find((p) => p.slug === slug && p.status === "Published");
}

/** Toàn bộ bài viết (kể cả nháp) — dùng cho trang Admin. */
export async function getAllPostsForAdmin(): Promise<Post[]> {
  return getAllPostsRaw();
}
