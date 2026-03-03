"use client";

import { useState, useEffect } from "react";
import RoomBookedSlotsTable from "./RoomBookedSlotsTable";

type Room = { id: string; name: string };
type RoomWithAvailability = Room & { available?: boolean };
type Props = { rooms: Room[]; defaultRoomId?: string; defaultBookerName?: string; onSuccess?: () => void };

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00",
];

export default function BookingForm({ rooms, defaultRoomId, defaultBookerName = "", onSuccess }: Props) {
  const [roomId, setRoomId] = useState(defaultRoomId ?? "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [bookerName, setBookerName] = useState(defaultBookerName);
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [roomAvailability, setRoomAvailability] = useState<RoomWithAvailability[] | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const timeReady = date && startTime && endTime && endTime > startTime;

  useEffect(() => {
    if (!timeReady) {
      setRoomAvailability(null);
      return;
    }
    setLoadingAvailability(true);
    setRoomAvailability(null);
    const params = new URLSearchParams({ date, startTime, endTime });
    fetch(`/api/rooms?${params}`)
      .then((res) => res.json())
      .then((data: RoomWithAvailability[]) => {
        setRoomAvailability(data);
      })
      .catch(() => setRoomAvailability([]))
      .finally(() => setLoadingAvailability(false));
  }, [date, startTime, endTime, timeReady]);

  const endTimeOptions = TIME_OPTIONS.filter((t) => t > startTime);
  const roomList = roomAvailability ?? rooms;
  const selectedRoomUnavailable = timeReady && roomId && roomAvailability?.some((r) => r.id === roomId && r.available === false);

  const handleStartTimeChange = (t: string) => {
    setStartTime(t);
    if (endTime <= t) {
      const next = TIME_OPTIONS.find((opt) => opt > t);
      setEndTime(next ?? t);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (endTime <= startTime) {
      setError("结束时间必须晚于开始时间");
      return;
    }
    if (!roomId) {
      setError("请选择会议室");
      return;
    }
    if (selectedRoomUnavailable) {
      setError("所选会议室在该时段已被占用，请更换时间或会议室");
      return;
    }
    if (!bookerName.trim()) {
      setError("预订人不能为空");
      return;
    }
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
          bookerName: bookerName.trim() || undefined,
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
      setSuccess("预订成功！");
      onSuccess?.();
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="font-medium">新建预订</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

      <div>
        <label className="block text-sm text-gray-600">会议室</label>
        <select
          required
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="">请选择</option>
          {roomList.map((r) => {
            const status = "available" in r && r.available === false ? " (该时段已占用)" : "available" in r && r.available ? " (可选)" : "";
            return (
              <option key={r.id} value={r.id}>{r.name}{status}</option>
            );
          })}
        </select>
        {timeReady && loadingAvailability && (
          <p className="mt-1 text-xs text-gray-500">正在查询该时段占用情况…</p>
        )}
        {selectedRoomUnavailable && (
          <p className="mt-1 text-sm text-amber-600">该时段此会议室已被占用，请更换时间或选择其他会议室。</p>
        )}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600">开始时间</label>
          <select
            value={startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
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
            {endTimeOptions.length > 0 ? (
              endTimeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))
            ) : (
              <option value={startTime}>请先选开始时间</option>
            )}
          </select>
        </div>
      </div>

      {roomId && date && (
        <RoomBookedSlotsTable
          roomId={roomId}
          startDate={date}
          days={7}
        />
      )}

      <div>
        <label className="block text-sm text-gray-600">预订人 <span className="text-red-500">*</span></label>
        <input
          type="text"
          required
          value={bookerName}
          onChange={(e) => setBookerName(e.target.value)}
          placeholder="默认当前用户，可修改"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
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
        disabled={loading || !!selectedRoomUnavailable}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "提交中…" : "提交预订"}
      </button>
    </form>
  );
}
