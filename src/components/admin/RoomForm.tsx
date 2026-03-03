"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Room = {
  id: string;
  name: string;
  capacity: number;
  facilities: string;
  description: string | null;
  photoUrls: string | null;
  isActive: boolean;
};

export default function RoomForm({ room }: { room?: Room }) {
  const router = useRouter();
  const [name, setName] = useState(room?.name ?? "");
  const [capacity, setCapacity] = useState(room?.capacity ?? 10);
  const [facilities, setFacilities] = useState(room?.facilities ?? "");
  const [description, setDescription] = useState(room?.description ?? "");
  const [photoUrls, setPhotoUrls] = useState(room?.photoUrls ?? "");
  const [isActive, setIsActive] = useState(room?.isActive ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const appendPhotoUrl = (url: string) => {
    const list = photoUrls ? photoUrls.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (!list.includes(url)) list.push(url);
    setPhotoUrls(list.join(", "));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "上传失败");
        return;
      }
      appendPhotoUrl(data.url);
      setError("");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (room) {
        const res = await fetch(`/api/rooms/${room.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            capacity: Number(capacity) || 10,
            facilities: facilities.trim() || "—",
            description: description.trim() || null,
            photoUrls: photoUrls.trim() || null,
            isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "更新失败");
          return;
        }
        router.push("/admin/rooms");
        router.refresh();
      } else {
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            capacity: Number(capacity) || 10,
            facilities: facilities.trim() || "—",
            description: description.trim() || null,
            photoUrls: photoUrls.trim() || null,
            isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "添加失败");
          return;
        }
        router.push("/admin/rooms");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-4 rounded-lg border bg-white p-6 shadow-sm"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm text-gray-600">会议室名称 <span className="text-red-500">*</span></label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">容量（人）</label>
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value) || 10)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">设施描述</label>
        <input
          type="text"
          value={facilities}
          onChange={(e) => setFacilities(e.target.value)}
          placeholder="如：投影仪,白板,视频会议"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">备注</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">照片</label>
        <div className="mt-1 flex flex-wrap gap-2">
          <label className="cursor-pointer rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300">
            {uploading ? "上传中…" : "上传图片"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <input
            type="text"
            value={photoUrls}
            onChange={(e) => setPhotoUrls(e.target.value)}
            placeholder="图片 URL，多个用逗号分隔"
            className="min-w-[200px] flex-1 rounded border border-gray-300 px-3 py-2"
          />
        </div>
        {photoUrls && (
          <div className="mt-2 flex flex-wrap gap-2">
            {photoUrls.split(",").map((url) => url.trim()).filter(Boolean).map((url) => (
              <a
                key={url}
                href={url.startsWith("http") ? url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-16 w-24 overflow-hidden rounded border bg-gray-100"
              >
                {url.startsWith("/") || url.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-gray-400">URL</span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="isActive" className="text-sm text-gray-600">
          启用（未启用则不可被预订）
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "提交中…" : room ? "保存" : "添加"}
      </button>
    </form>
  );
}
