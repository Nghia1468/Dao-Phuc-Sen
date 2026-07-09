"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import type { SheetPost } from "@/lib/googleSheets";
import PostForm, { type PostFormValues } from "@/components/admin/PostForm";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<SheetPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PostFormValues | undefined>(undefined);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tải được danh sách bài viết.");
        setPosts([]);
      } else {
        setPosts(data.posts);
      }
    } catch {
      setError("Không thể kết nối máy chủ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Xóa bài viết "${slug}"?`)) return;
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Xóa thất bại.");
      } else {
        await load();
      }
    } catch {
      alert("Không thể kết nối máy chủ.");
    }
    setDeletingSlug(null);
  };

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (p: SheetPost) => {
    const { rowNumber, ...rest } = p;
    void rowNumber;
    setEditing(rest);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Quản lý bài viết</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-ink hover:text-clayDark transition-colors"
          >
            <RefreshCw size={14} /> Tải lại
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-ink text-white text-sm rounded-soft hover:bg-clayDark transition-colors"
          >
            <Plus size={15} /> Viết bài mới
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-white border border-red-200 text-red-600 text-sm rounded-soft p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkLight">Đang tải...</p>
      ) : posts.length === 0 && !error ? (
        <p className="text-sm text-inkLight">Chưa có bài viết nào.</p>
      ) : (
        <div className="bg-white rounded-softLg overflow-hidden shadow-whisper">
          <table className="w-full text-sm">
            <thead className="bg-sand/60 text-inkLight text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Ảnh</th>
                <th className="text-left px-4 py-3">Tiêu đề</th>
                <th className="text-left px-4 py-3">Ngày đăng</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="text-right px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.slug} className="border-t border-blush/60">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 rounded-soft overflow-hidden bg-sand">
                      {p.coverImage && (
                        <Image src={p.coverImage} alt={p.title} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink line-clamp-1">{p.title}</p>
                    <p className="text-xs text-inkLight">/blog/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-inkLight">{p.publishedAt}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        p.status === "Published"
                          ? "bg-blush text-clayDark"
                          : "bg-sand text-inkLight"
                      }`}
                    >
                      {p.status === "Published" ? "Đã xuất bản" : "Nháp"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {p.status === "Published" && (
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Xem bài viết"
                          className="text-ink hover:text-clayDark"
                        >
                          <ExternalLink size={15} strokeWidth={1.5} />
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(p)}
                        aria-label="Sửa"
                        className="text-ink hover:text-clayDark"
                      >
                        <Pencil size={15} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.slug)}
                        disabled={deletingSlug === p.slug}
                        aria-label="Xóa"
                        className="text-ink hover:text-red-500 disabled:opacity-40"
                      >
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <PostForm
          initial={editing}
          isEditing={!!editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
