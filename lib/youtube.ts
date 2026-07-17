// ---------------------------------------------------------------------------
// Helper cho trường "video" của sản phẩm — có thể là:
//   1. Link Youtube (khách dán từ trình duyệt, dạng watch?v=, youtu.be/, shorts/...)
//   2. URL video tải trực tiếp (mp4/webm... đã upload lên Cloudinary)
// ---------------------------------------------------------------------------

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"];

export function isYouTubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return YOUTUBE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

/** Lấy videoId từ mọi dạng link Youtube phổ biến. Trả về null nếu không nhận diện được. */
export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!YOUTUBE_HOSTS.includes(u.hostname)) return null;

    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1) || null;
    }
    if (u.pathname.startsWith("/shorts/")) {
      return u.pathname.split("/")[2] || null;
    }
    if (u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/")[2] || null;
    }
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

/** Trả về URL nhúng (embed) dùng cho <iframe>, hoặc null nếu không phải link Youtube hợp lệ. */
export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

/** Ảnh đại diện (thumbnail) của video Youtube — dùng làm ảnh preview trong khung admin. */
export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
