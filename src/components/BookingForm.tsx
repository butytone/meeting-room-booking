"use client";

import { useState } from "react";
import RoomBookedSlotsTable from "./RoomBookedSlotsTable";

type Room = { id: string; name: string };
type Props = { rooms: Room[]; defaultRoomId?: string; onSuccess?: () => void };

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00",
];

export default function BookingForm({ rooms, defaultRoomId, onSuccess }: Props) {
  const [roomId, setRoomId] = useState(defaultRoomId ?? "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          date,
          startTime,
          endTime,
          purpose: purpose || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "预订失败");
        return;
      }
      setRoomId("");
      setDate("");
      setPurpose("");
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="font-medium">新建预订</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm text-gray-600">会议室</label>
        <select
          required
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="">请选择</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">日期</label>
        <input
          type="date"
          required
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      {roomId && (
        <RoomBookedSlotsTable
          roomId={roomId}
          startDate={date || new Date().toISOString().slice(0, 10)}
          days={7}
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600">开始时间</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">结束时间</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-600">用途（选填）</label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="如：教研组会议"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "提交中…" : "提交预订"}
      </button>
    </form>
  );
}
