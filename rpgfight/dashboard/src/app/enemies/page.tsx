"use client";

import { useState, useEffect } from "react";

interface EnemyTemplate {
  id: number;
  name: string;
  displayName: string;
  hp: number;
  speedModifier: number;
  spriteWalk: string;
  spriteDead: string;
  spriteScale: number;
  description: string;
}

export default function EnemiesPage() {
  const [enemies, setEnemies] = useState<EnemyTemplate[]>([]);
  const [editing, setEditing] = useState<EnemyTemplate | null>(null);
  const [form, setForm] = useState({
    name: "", displayName: "", hp: 1, speedModifier: 0,
    spriteWalk: "", spriteScale: 1.0, description: "",
  });

  async function load() {
    const res = await fetch("/api/enemies");
    setEnemies(await res.json());
  }

  useEffect(() => { load(); }, []);

  function startEdit(e: EnemyTemplate) {
    setEditing(e);
    setForm({
      name: e.name, displayName: e.displayName, hp: e.hp, speedModifier: e.speedModifier,
      spriteWalk: e.spriteWalk, spriteScale: e.spriteScale ?? 1.0, description: e.description,
    });
  }

  function startNew() {
    setEditing(null);
    setForm({ name: "", displayName: "", hp: 1, speedModifier: 0, spriteWalk: "", spriteScale: 1.0, description: "" });
  }

  async function save() {
    if (!form.name || !form.displayName) return;
    if (editing) {
      await fetch(`/api/enemies/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/enemies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    startNew();
    load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this enemy template?")) return;
    await fetch(`/api/enemies/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Enemy Templates</h1>
          <p className="text-gray-500 mt-1">Define enemy types with their sprites, then assign them to stages</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          {editing ? `Edit: ${editing.displayName}` : "New Enemy Template"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Internal Name (unique, no spaces)</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
              placeholder="Knight01"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Display Name</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
              placeholder="Dark Knight"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">HP</label>
            <input
              type="number"
              value={form.hp}
              onChange={(e) => setForm({ ...form, hp: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Speed Modifier</label>
            <input
              type="number"
              step="0.1"
              value={form.speedModifier}
              onChange={(e) => setForm({ ...form, speedModifier: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sprite Scale</label>
            <input
              type="number"
              step="0.1"
              value={form.spriteScale}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) setForm({ ...form, spriteScale: v });
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
            />
            <p className="text-xs text-gray-600 mt-1">
              1.0 = natural size, 1.5 = 50% bigger, 0.5 = half size
            </p>
          </div>
          <div>
            {/* empty cell for grid alignment */}
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">
              Sprite Folder
            </label>
            <input
              value={form.spriteWalk}
              onChange={(e) => setForm({ ...form, spriteWalk: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
              placeholder="images/sprites/knight_01"
            />
            <p className="text-xs text-gray-600 mt-1">
              Folder containing walk_000.png-009, die_000.png-009, etc.
            </p>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
              placeholder="A heavily armored knight enemy"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={save} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors">
            {editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button onClick={startNew} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {enemies.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No enemy templates yet</p>
          <p className="text-sm mt-2">Create your first enemy template above</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {enemies.map((e) => (
            <div key={e.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div>
                <span className="font-medium text-gray-200">{e.displayName}</span>
                <span className="ml-2 text-xs text-gray-600">({e.name})</span>
                <span className="ml-3 px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">{e.hp} HP</span>
                {e.spriteScale !== 1.0 && <span className="ml-2 px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">{e.spriteScale}x</span>}
                {e.description && <p className="text-xs text-gray-500 mt-1">{e.description}</p>}
                {e.spriteWalk && <p className="text-xs text-gray-600 mt-0.5">Sprites: {e.spriteWalk}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(e)} className="px-3 py-1 text-xs text-gray-400 hover:text-amber-400 transition-colors">Edit</button>
                <button onClick={() => remove(e.id)} className="px-3 py-1 text-xs text-gray-600 hover:text-red-400 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
