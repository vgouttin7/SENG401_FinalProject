"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface StageEnemy {
  id: number;
  enemyTemplateId: number;
  minSpeed: number;
  maxSpeed: number;
  enemyTemplate: { id: number; name: string; displayName: string };
}

interface EnemyTemplate {
  id: number;
  name: string;
  displayName: string;
  speedModifier: number;
  hp: number;
}

interface Props {
  stageId: number;
  stageEnemies: StageEnemy[];
  onSave: () => void;
}

export default function EnemiesEditor({ stageId, stageEnemies, onSave }: Props) {
  const [templates, setTemplates] = useState<EnemyTemplate[]>([]);
  const [newTemplateId, setNewTemplateId] = useState(0);
  const [newMinSpeed, setNewMinSpeed] = useState(1);
  const [newMaxSpeed, setNewMaxSpeed] = useState(3);

  useEffect(() => {
    fetch(api("/api/enemies")).then((r) => r.json()).then(setTemplates);
  }, []);

  const usedIds = new Set(stageEnemies.map((se) => se.enemyTemplateId));
  const available = templates.filter((t) => !usedIds.has(t.id));

  async function addEnemy() {
    if (!newTemplateId) return;
    await fetch(api(`/api/stages/${stageId}/enemies`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enemyTemplateId: newTemplateId, minSpeed: newMinSpeed, maxSpeed: newMaxSpeed }),
    });
    setNewTemplateId(0);
    onSave();
  }

  async function removeEnemy(stageEnemyId: number) {
    await fetch(api(`/api/stages/${stageId}/enemies`), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageEnemyId }),
    });
    onSave();
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {stageEnemies.map((se) => (
          <div key={se.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div>
              <span className="font-medium text-gray-200">{se.enemyTemplate.displayName}</span>
              <span className="ml-3 text-sm text-gray-500">Speed: {se.minSpeed}-{se.maxSpeed}</span>
            </div>
            <button onClick={() => removeEnemy(se.id)} className="text-xs text-gray-600 hover:text-red-400">Remove</button>
          </div>
        ))}
        {stageEnemies.length === 0 && (
          <p className="text-gray-600 text-sm">No enemies assigned to this stage.</p>
        )}
      </div>

      {available.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-400">Add Enemy Type</h3>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Enemy</label>
              <select
                value={newTemplateId}
                onChange={(e) => setNewTemplateId(parseInt(e.target.value))}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
              >
                <option value={0}>Select...</option>
                {available.map((t) => (
                  <option key={t.id} value={t.id}>{t.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Speed</label>
              <input type="number" value={newMinSpeed} onChange={(e) => setNewMinSpeed(parseInt(e.target.value) || 0)} className="w-20 px-2 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Speed</label>
              <input type="number" value={newMaxSpeed} onChange={(e) => setNewMaxSpeed(parseInt(e.target.value) || 0)} className="w-20 px-2 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200" />
            </div>
            <button onClick={addEnemy} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
