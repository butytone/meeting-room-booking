"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("确定要取消该预订吗？")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="rounded border border-red-300 bg-white px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "取消中…" : "取消预订"}
    </button>
  );
}
