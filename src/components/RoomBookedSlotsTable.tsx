"use client";

import { useEffect, useState } from "react";

type BookedSlot = {
  startTime: string;
  endTime: string;
  userName: string | null;
  purpose: string | null;
};

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30",
];

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function formatDateLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEKDAYS[d.getDay()];
  return `${m}月${day}日 ${w}`;
}

function slotEnd(slot: string): string {
  const idx = TIME_SLOTS.indexOf(slot);
  if (idx < 0 || idx === TIME_SLOTS.length - 1) return "21:00";
  return TIME_SLOTS[idx + 1];
}

function getBookerForSlot(bookings: BookedSlot[], slotStart: string): string | null {
  const slotEndTime = slotEnd(slotStart);
  for (const b of bookings) {
    if (b.startTime < slotEndTime && b.endTime > slotStart) {
      return b.userName ?? null;
    }
  }
  return null;
}

type Props = {
  roomId: string;
  startDate: string;
  days?: number;
  className?: string;
};

export default function RoomBookedSlotsTable({
  roomId,
  startDate,
  days = 7,
  className = "",
}: Props) {
  const [dataByDate, setDataByDate] = useState<Record<string, BookedSlot[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dateList: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate + "T12:00:00");
    d.setDate(d.getDate() + i);
    dateList.push(d.toISOString().slice(0, 10));
  }

  useEffect(() => {
    if (!roomId || !startDate) return;
    const list: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate + "T12:00:00");
      d.setDate(d.getDate() + i);
      list.push(d.toISOString().slice(0, 10));
    }
    setLoading(true);
    setError("");
    const promises = list.map((date) =>
      fetch(
        `/api/bookings?roomId=${encodeURIComponent(roomId)}&date=${encodeURIComponent(date)}`
      ).then((res) => (res.ok ? res.json() : []))
    );
    Promise.all(promises)
      .then((results: BookedSlot[][]) => {
        const next: Record<string, BookedSlot[]> = {};
        list.forEach((date, i) => {
          next[date] = Array.isArray(results[i]) ? results[i] : [];
        });
        setDataByDate(next);
      })
      .catch(() => setError("加载预订数据失败"))
      .finally(() => setLoading(false));
  }, [roomId, startDate, days]);

  if (!roomId || !startDate) return null;

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 bg-white ${className}`}>
      <h4 className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
        已预订时段（纵列：时间段，横列：日期）
      </h4>
      {loading && (
        <div className="p-4 text-center text-sm text-gray-500">加载中…</div>
      )}
      {error && (
        <div className="p-4 text-center text-sm text-red-600">{error}</div>
      )}
      {!loading && !error && (
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 min-w-[100px] border border-gray-200 px-2 py-2 text-left font-medium text-gray-700">
                日期
              </th>
              {TIME_SLOTS.map((slot) => (
                <th
                  key={slot}
                  className="min-w-[72px] border border-gray-200 px-1 py-2 font-medium text-gray-700"
                >
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dateList.map((date) => (
              <tr key={date} className="hover:bg-gray-50/50">
                <td className="sticky left-0 z-10 border border-gray-200 bg-white px-2 py-1.5 font-medium text-gray-700">
                  {formatDateLabel(date)}
                </td>
                {TIME_SLOTS.map((slot) => {
                  const booker = getBookerForSlot(
                    dataByDate[date] ?? [],
                    slot
                  );
                  return (
                    <td
                      key={slot}
                      className="border border-gray-200 px-1 py-1.5 text-center text-gray-800"
                    >
                      {booker ? (
                        <span className="text-gray-800">{booker}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
