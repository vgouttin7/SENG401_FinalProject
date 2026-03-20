"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

const EMPTY_MAP = Array.from({ length: 18 }, (_, r) => {
  if (r === 16) return Array(32).fill(2);
  if (r === 17) return Array(32).fill(1);
  return Array(32).fill(0);
});

export default function NewStagePage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [form, setForm] = useState({
    stageNum: 1,
    eraName: "",
    roundTime: 45,
    spawnInterval: 6,
    background: "",
    requiresStomp: false,
    reviveSeconds: 0,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Create stage via campaign stages endpoint
    const res = await fetch(`/api/stages/${campaignId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, campaignId: parseInt(campaignId), tileMap: EMPTY_MAP }),
    });

    if (!res.ok) {
      // Use direct prisma route instead
      const res2 = await fetch(`/api/campaigns/${campaignId}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, campaignId: parseInt(campaignId), tileMap: EMPTY_MAP }),
      });
      if (res2.ok) {
        router.push(`/campaigns/${campaignId}`);
        return;
      }
      alert("Failed to create stage");
      setSaving(false);
      return;
    }

    router.push(`/campaigns/${campaignId}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold text-amber-400 mb-8">New Stage</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Stage Number</label>
            <input type="number" value={form.stageNum} onChange={(e) => setForm({ ...form, stageNum: parseInt(e.target.value) || 1 })} required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Round Time (seconds)</label>
            <input type="number" value={form.roundTime} onChange={(e) => setForm({ ...form, roundTime: parseInt(e.target.value) || 45 })} className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Era Name</label>
          <input type="text" value={form.eraName} onChange={(e) => setForm({ ...form, eraName: e.target.value })} placeholder="e.g., The Golden Age of Athens" required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Background Image Path</label>
          <input type="text" value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} placeholder="images/backgrounds/stage_1_bg.png" className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none" />
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Stage"}</button>
          <button type="button" onClick={() => router.push(`/campaigns/${campaignId}`)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
