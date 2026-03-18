"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetDefaultButton() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleReset() {
    setLoading(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        alert("Reset failed: " + (data.error ?? "Unknown error"));
      }
    } catch (err) {
      alert("Reset failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">Reset all data to defaults?</span>
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Yes, Reset"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 font-semibold rounded-lg transition-colors text-sm"
    >
      Reset to Default
    </button>
  );
}
