"use client";

import { useState } from "react";
import RoomBookedSlotsTable from "./RoomBookedSlotsTable";

type Props = { roomId: string };

const today = new Date().toISOString().slice(0, 10);

export default function RoomBookedSlotsWithDatePicker({ roomId }: Props) {
  const [startDate, setStartDate] = useState(today);

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-medium text-gray-800">已预订时段</h3>
      <div className="mb-3">
        <label className="block text-sm text-gray-600">起始日期（显示该日起 7 天）</label>
        <input
          type="date"
          min={today}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <RoomBookedSlotsTable roomId={roomId} startDate={startDate} days={7} />
    </div>
  );
}
