"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function AdminRoomsClient({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "删除失败");
        return;
      }
      setConfirmId(null);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-4 shadow-sm"
        >
          <div>
            <p className="font-medium">
              {room.name}
              {!room.isActive && (
                <span className="ml-2 text-sm text-gray-500">（已停用）</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              容量 {room.capacity} 人 · {room.facilities}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/rooms/${room.id}/edit`}
              className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            >
              编辑
            </Link>
            {confirmId === room.id ? (
              <>
                <span className="text-sm text-amber-600">确定删除？</span>
                <button
                  type="button"
                  onClick={() => handleDelete(room.id, room.name)}
                  disabled={deletingId === room.id}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === room.id ? "删除中…" : "确认删除"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(room.id)}
                className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
              >
                删除
              </button>
            )}
          </div>
        </div>
      ))}
      {rooms.length === 0 && (
        <p className="rounded-lg border bg-gray-50 p-6 text-center text-gray-500">
          暂无会议室，请点击「添加会议室」创建。
        </p>
      )}
      {confirmId && (
        <p className="text-sm text-amber-600">
          删除会议室将同时删除该会议室的所有预订记录，且不可恢复。请确认后再点「确认删除」。
        </p>
      )}
    </div>
  );
}
