"use client";

import { useState, useEffect } from "react";

interface Character {
  id: number;
  name: string;
  color: string;
  portrait: string;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editing, setEditing] = useState<Character | null>(null);
  const [form, setForm] = useState({ name: "", color: "#ffffff", portrait: "" });

  async function load() {
    const res = await fetch("/api/characters");
    setCharacters(await res.json());
  }

  useEffect(() => { load(); }, []);

  function startEdit(c: Character) {
    setEditing(c);
    setForm({ name: c.name, color: c.color ?? "#ffffff", portrait: c.portrait ?? "" });
  }

  function startNew() {
    setEditing(null);
    setForm({ name: "", color: "#ffffff", portrait: "" });
  }

  async function save() {
    if (!form.name) return;
    if (editing) {
      await fetch(`/api/characters/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({ name: "", color: "#ffffff", portrait: "" });
    setEditing(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this character?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Characters</h1>
          <p className="text-gray-500 mt-1">Manage dialogue characters and their portraits</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          {editing ? `Edit: ${editing.name}` : "New Character"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
              placeholder="Cyrus the Great"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Portrait path (relative to game/images/)</label>
            <input
              value={form.portrait}
              onChange={(e) => setForm({ ...form, portrait: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
              placeholder="images/cyrus/cyrus neutral.png"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Color (hex)</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
              />
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
              />
            </div>
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
      {characters.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No characters yet</p>
          <p className="text-sm mt-2">Create your first character above</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {characters.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <div>
                  <span className="font-medium text-gray-200">{c.name}</span>
                  {c.portrait && (
                    <span className="ml-2 text-xs text-gray-600">{c.portrait}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(c)} className="px-3 py-1 text-xs text-gray-400 hover:text-amber-400 transition-colors">Edit</button>
                <button onClick={() => remove(c.id)} className="px-3 py-1 text-xs text-gray-600 hover:text-red-400 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
