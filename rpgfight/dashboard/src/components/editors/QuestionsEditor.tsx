"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Question {
  id: number;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  sortOrder: number;
}

interface Props {
  stageId: number;
  questions: Question[];
  onSave: () => void;
}

export default function QuestionsEditor({ stageId, questions, onSave }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ text: "", choices: ["", "", "", ""], correctIndex: 0, explanation: "" });
  const [showNew, setShowNew] = useState(false);

  function startEdit(q: Question) {
    setEditingId(q.id);
    setForm({ text: q.text, choices: [...q.choices], correctIndex: q.correctIndex, explanation: q.explanation });
  }

  async function saveEdit(id: number) {
    await fetch(api(`/api/stages/${stageId}/questions/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditingId(null);
    onSave();
  }

  async function deleteQuestion(id: number) {
    await fetch(api(`/api/stages/${stageId}/questions/${id}`), { method: "DELETE" });
    onSave();
  }

  async function createQuestion() {
    await fetch(api(`/api/stages/${stageId}/questions`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: questions.length }),
    });
    setForm({ text: "", choices: ["", "", "", ""], correctIndex: 0, explanation: "" });
    setShowNew(false);
    onSave();
  }

  function renderForm(onSubmit: () => void, submitLabel: string) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Question</label>
          <textarea
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {form.choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.correctIndex === i}
                onChange={() => setForm({ ...form, correctIndex: i })}
                className="w-3 h-3"
              />
              <input
                type="text"
                value={c}
                onChange={(e) => {
                  const newChoices = [...form.choices];
                  newChoices[i] = e.target.value;
                  setForm({ ...form, choices: newChoices });
                }}
                placeholder={`Choice ${i + 1}`}
                className={`flex-1 px-2 py-1 bg-gray-800 border rounded text-sm ${
                  form.correctIndex === i ? "border-green-600 text-green-300" : "border-gray-700 text-gray-200"
                }`}
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Explanation (shown after answering)</label>
          <textarea
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onSubmit} className="px-4 py-1.5 bg-amber-500 text-gray-900 text-sm rounded font-medium">{submitLabel}</button>
          <button onClick={() => { setEditingId(null); setShowNew(false); }} className="px-4 py-1.5 bg-gray-700 text-gray-300 text-sm rounded">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {questions.sort((a, b) => a.sortOrder - b.sortOrder).map((q, idx) => (
          <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            {editingId === q.id ? (
              renderForm(() => saveEdit(q.id), "Save")
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 font-medium">
                      <span className="text-gray-600 mr-2">Q{idx + 1}.</span>
                      {q.text}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {q.choices.map((c, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded ${
                          i === q.correctIndex ? "bg-green-900/50 text-green-400" : "text-gray-500"
                        }`}>
                          {c}
                        </span>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="mt-2 text-xs text-gray-600 italic">{q.explanation}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button onClick={() => startEdit(q)} className="text-xs text-gray-600 hover:text-amber-400">Edit</button>
                    <button onClick={() => deleteQuestion(q.id)} className="text-xs text-gray-600 hover:text-red-400">Del</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showNew ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">New Question</h3>
          {renderForm(createQuestion, "Create")}
        </div>
      ) : (
        <button
          onClick={() => { setShowNew(true); setForm({ text: "", choices: ["", "", "", ""], correctIndex: 0, explanation: "" }); }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors"
        >
          + Add Question
        </button>
      )}
    </div>
  );
}
