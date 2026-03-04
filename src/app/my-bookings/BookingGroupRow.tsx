"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRecurrenceSummary } from "@/lib/recurrence";

type BookingWithRoom = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  bookerName: string | null;
  purpose: string | null;
  recurrenceGroupId: string | null;
  recurrenceRule: string | null;
  recurrenceEndDate: string | null;
  room: { name: string };
};

type Props = {
  isSeries: boolean;
  first: BookingWithRoom;
  count: number;
};

export default function BookingGroupRow({ isSeries, first, count }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    const msg = isSeries
      ? "确定要取消该周期性会议吗？将删除该系列下的全部预订。"
      : "确定要取消该预订吗？";
    if (!confirm(msg)) return;
    setLoading(true);
    try {
      if (isSeries) {
        const res = await fetch(`/api/bookings/${first.id}?cancelSeries=true`, { method: "DELETE" });
        if (res.ok) router.refresh();
      } else {
        const res = await fetch(`/api/bookings/${first.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        });
        if (res.ok) router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const summary = isSeries && first.recurrenceRule && first.recurrenceEndDate
    ? formatRecurrenceSummary(
        first.recurrenceRule,
        first.date,
        first.startTime,
        first.endTime,
        first.recurrenceEndDate
      )
    : `${first.date} ${first.startTime}–${first.endTime}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium">{first.room.name}</p>
        <p className="text-sm text-gray-600">
          {summary}
          {isSeries && <span className="ml-2 text-gray-500">共 {count} 次</span>}
          <span className="ml-2">预订人：{(first.bookerName && first.bookerName.trim()) ? first.bookerName.trim() : "—"}</span>
        </p>
        {first.purpose && (
          <p className="text-sm text-gray-500">{first.purpose}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="rounded border border-red-300 bg-white px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "处理中…" : isSeries ? "取消周期性会议" : "取消预订"}
      </button>
    </div>
  );
}
