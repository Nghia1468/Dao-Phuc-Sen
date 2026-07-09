"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Đăng nhập thất bại.");
        setLoading(false);
        return;
      }
      router.push("/admin/san-pham");
      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-sand/40 flex items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-softLg shadow-lift p-8 w-full max-w-sm"
      >
        <div className="h-12 w-12 rounded-full bg-blush flex items-center justify-center mx-auto mb-5">
          <Lock size={20} className="text-clayDark" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl text-ink text-center mb-1">
          Đăng nhập Admin
        </h1>
        <p className="text-xs text-inkLight text-center mb-6">
          Dao Phúc Sen — Trang quản trị
        </p>

        <input
          type="password"
          required
          autoFocus
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-blush rounded-soft px-4 py-3 text-sm focus:outline-none focus:border-clay mb-3"
        />

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-ink text-white text-sm tracking-wide rounded-soft hover:bg-clayDark transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
