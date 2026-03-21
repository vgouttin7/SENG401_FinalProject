"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import VictoryDialogueEditor from "@/components/editors/VictoryDialogueEditor";

interface VictoryLine {
  id: number;
  characterId: number;
  text: string;
  portrait: string;
  sortOrder: number;
  character: { id: number; name: string; color: string };
}

interface Props {
  campaignId: number;
  victoryMusic: string;
  victoryLines: VictoryLine[];
}

export default function CampaignVictorySection({ campaignId, victoryMusic: initialMusic, victoryLines: initialLines }: Props) {
  const [music, setMusic] = useState(initialMusic ?? "");
  const [lines, setLines] = useState(initialLines);
  const [saving, setSaving] = useState(false);

  async function saveMusic() {
    setSaving(true);
    await fetch(api(`/api/campaigns/${campaignId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ victoryMusic: music }),
    });
    setSaving(false);
  }

  async function reload() {
    const res = await fetch(api(`/api/campaigns/${campaignId}/victory-lines`));
    if (res.ok) setLines(await res.json());
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Victory / Ending</h2>
      <p className="text-gray-500 text-sm mb-6">
        Configure the dialogue and music shown after the player completes all stages.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-1">Victory Music Path</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={music}
            onChange={(e) => setMusic(e.target.value)}
            placeholder="e.g. audio/victory_background_music.mp3"
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={saveMusic}
            disabled={saving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <VictoryDialogueEditor campaignId={campaignId} victoryLines={lines} onSave={reload} />
    </div>
  );
}
