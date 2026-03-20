"use client";

import { useState, useEffect } from "react";

interface VictoryLine {
  id: number;
  characterId: number;
  text: string;
  portrait: string;
  sortOrder: number;
  character: { id: number; name: string; color: string };
}

interface Character {
  id: number;
  name: string;
  color: string;
}

interface Props {
  campaignId: number;
  victoryLines: VictoryLine[];
  onSave: () => void;
}

export default function VictoryDialogueEditor({ campaignId, victoryLines, onSave }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newText, setNewText] = useState("");
  const [newCharId, setNewCharId] = useState<number>(0);
  const [newPortrait, setNewPortrait] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editCharId, setEditCharId] = useState(0);
  const [editPortrait, setEditPortrait] = useState("");

  useEffect(() => {
    fetch("/api/characters").then((r) => r.json()).then(setCharacters);
  }, []);

  async function addLine() {
    if (!newText.trim() || !newCharId) return;
    await fetch(`/api/campaigns/${campaignId}/victory-lines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId: newCharId,
        text: newText,
        portrait: newPortrait,
      }),
    });
    setNewText("");
    setNewPortrait("");
    onSave();
  }

  async function deleteLine(lineId: number) {
    await fetch(`/api/campaigns/${campaignId}/victory-lines?lineId=${lineId}`, { method: "DELETE" });
    onSave();
  }

  async function updateLine(lineId: number) {
    await fetch(`/api/campaigns/${campaignId}/victory-lines`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lineId, characterId: editCharId, text: editText, portrait: editPortrait }),
    });
    setEditingId(null);
    onSave();
  }

  function startEdit(line: VictoryLine) {
    setEditingId(line.id);
    setEditText(line.text);
    setEditCharId(line.characterId);
    setEditPortrait(line.portrait || "");
  }

  return (
    <div>
      <p className="text-gray-500 text-sm mb-4">
        These dialogue lines play after the player completes all stages in this campaign.
      </p>

      <div className="space-y-2 mb-6">
        {victoryLines
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((line, idx) => (
            <div key={line.id} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-3">
              <span className="text-xs text-gray-600 mt-1 w-6 text-right">{idx + 1}</span>
              {editingId === line.id ? (
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={editCharId}
                      onChange={(e) => setEditCharId(parseInt(e.target.value))}
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
                    >
                      {characters.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editPortrait}
                      onChange={(e) => setEditPortrait(e.target.value)}
                      placeholder="Portrait path"
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
                    />
                  </div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => updateLine(line.id)} className="px-3 py-1 bg-amber-500 text-gray-900 text-xs rounded font-medium">Save</button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="shrink-0 w-40">
                    <span
                      className="text-sm font-medium"
                      style={{ color: line.character.color }}
                    >
                      {line.character.name}
                    </span>
                    {line.portrait && (
                      <p className="text-xs text-gray-600 truncate" title={line.portrait}>{line.portrait.split("/").pop()}</p>
                    )}
                  </div>
                  <p className="flex-1 text-sm text-gray-300">{line.text}</p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(line)} className="text-gray-600 hover:text-amber-400 text-xs">Edit</button>
                    <button onClick={() => deleteLine(line.id)} className="text-gray-600 hover:text-red-400 text-xs">Del</button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Add Victory Dialogue Line</h3>
        <div className="flex gap-3">
          <select
            value={newCharId}
            onChange={(e) => setNewCharId(parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
          >
            <option value={0}>Select character...</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newPortrait}
            onChange={(e) => setNewPortrait(e.target.value)}
            placeholder="Portrait path (optional)"
            className="w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Victory dialogue text..."
            onKeyDown={(e) => e.key === "Enter" && addLine()}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={addLine}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
