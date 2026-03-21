"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Props {
  stage: {
    id: number;
    eraName: string;
    roundTime: number;
    spawnInterval: number;
    background: string;
    requiresStomp: boolean;
    reviveSeconds: number;
    completionMessage: string;
    retryMessage: string;
    dialogueMusic: string;
    combatMusic: string;
    quizMusic: string;
  };
  onSave: () => void;
}

export default function StageSettingsEditor({ stage, onSave }: Props) {
  const [form, setForm] = useState({
    eraName: stage.eraName,
    roundTime: stage.roundTime,
    spawnInterval: stage.spawnInterval,
    background: stage.background,
    requiresStomp: stage.requiresStomp,
    reviveSeconds: stage.reviveSeconds ?? 0,
    completionMessage: stage.completionMessage ?? "",
    retryMessage: stage.retryMessage ?? "",
    dialogueMusic: stage.dialogueMusic ?? "",
    combatMusic: stage.combatMusic ?? "",
    quizMusic: stage.quizMusic ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(api(`/api/stages/${stage.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      onSave();
    } else {
      alert("Failed to save");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Era Name</label>
        <input
          type="text"
          value={form.eraName}
          onChange={(e) => setForm({ ...form, eraName: e.target.value })}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Round Time (seconds)</label>
          <input
            type="number"
            value={form.roundTime}
            onChange={(e) => setForm({ ...form, roundTime: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Spawn Interval (seconds)</label>
          <input
            type="number"
            value={form.spawnInterval}
            onChange={(e) => setForm({ ...form, spawnInterval: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Background Image Path</label>
        <input
          type="text"
          value={form.background}
          onChange={(e) => setForm({ ...form, background: e.target.value })}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Completion Message</label>
        <input
          type="text"
          value={form.completionMessage}
          onChange={(e) => setForm({ ...form, completionMessage: e.target.value })}
          placeholder="e.g. You survived the Elamite Period!"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
        />
        <p className="text-xs text-gray-600 mt-1">Shown after winning combat. Leave blank for default.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Retry Message</label>
        <input
          type="text"
          value={form.retryMessage}
          onChange={(e) => setForm({ ...form, retryMessage: e.target.value })}
          placeholder="e.g. You have fallen. But history gives second chances..."
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
        />
        <p className="text-xs text-gray-600 mt-1">Shown after losing combat. Leave blank for default.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Dialogue Music Path</label>
        <input
          type="text"
          value={form.dialogueMusic}
          onChange={(e) => setForm({ ...form, dialogueMusic: e.target.value })}
          placeholder="e.g. audio/story1_background_music.mp3"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Combat Music Path</label>
        <input
          type="text"
          value={form.combatMusic}
          onChange={(e) => setForm({ ...form, combatMusic: e.target.value })}
          placeholder="e.g. audio/zk_background_music.wav"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Quiz Music Path</label>
        <input
          type="text"
          value={form.quizMusic}
          onChange={(e) => setForm({ ...form, quizMusic: e.target.value })}
          placeholder="e.g. audio/kahoot_quiz_music.mp3"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.requiresStomp}
          onChange={(e) => setForm({ ...form, requiresStomp: e.target.checked })}
          className="w-4 h-4"
        />
        <label className="text-sm text-gray-400">Requires Stomp (beam knocks down, must stomp to kill)</label>
      </div>
      {form.requiresStomp && (
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Revive Seconds (0 = no revive)</label>
          <input
            type="number"
            value={form.reviveSeconds}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v)) setForm({ ...form, reviveSeconds: v });
            }}
            min={0}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
          />
          <p className="text-xs text-gray-600 mt-1">
            If &gt; 0, downed enemies will revive after this many seconds if not stomped
          </p>
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
