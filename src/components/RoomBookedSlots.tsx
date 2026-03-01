"use client";

import { useEffect, useState } from "react";

type BookedSlot = {
  startTime: string;
  endTime: string;
  userName: string | null;
  purpose: string | null;
};

type Props = {
  roomId: string;
  date: string;
  className?: string;
};

export default function RoomBookedSlots({ roomId, date, className = "" }: Props) {
  const [slots, setSlots] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId || !date) {
      setSlots([]);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`/api/bookings?roomId=${encodeURIComponent(roomId)}&date=${encodeURIComponent(date)}`)
      .then((res) => {
        if (!res.ok) throw new Error("加载失败");
        return res.json();
      })
      .then((data: BookedSlot[]) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setError("加载已预订时段失败"))
      .finally(() => setLoading(false));
  }, [roomId, date]);

  if (!roomId || !date) return null;

  return (
    <div className={`rounded-lg border border-gray-200 bg-gray-50 p-4 ${className}`}>
      <h4 className="mb-3 text-sm font-medium text-gray-700">当日已预订时段</h4>
      {loading && <p className="text-sm text-gray-500">加载中…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && slots.length === 0 && (
        <p className="text-sm text-gray-500">该日暂无预订</p>
      )}
      {!loading && !error && slots.length > 0 && (
        <ul className="space-y-2">
          {slots.map((s, i) => (
            <li
              key={`${s.startTime}-${s.endTime}-${i}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium text-gray-800">
                {s.startTime} – {s.endTime}
              </span>
              <span className="text-gray-600">预订人：{s.userName ?? "—"}</span>
              {s.purpose && (
                <span className="text-gray-500">用途：{s.purpose}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
