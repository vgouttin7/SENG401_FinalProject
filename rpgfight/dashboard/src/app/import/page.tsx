"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setJsonText(text);

    // Validate JSON
    try {
      const data = JSON.parse(text);
      if (data.campaign?.name && data.stages) {
        setMessage(`Loaded: "${data.campaign.name}" with ${data.stages.length} stages`);
        setStatus("idle");
      } else {
        setMessage("Invalid format: missing campaign.name or stages");
        setStatus("error");
      }
    } catch {
      setMessage("Invalid JSON file");
      setStatus("error");
    }
  }

  async function handleImport() {
    if (!jsonText) return;

    setStatus("loading");
    setMessage("Importing...");

    try {
      const data = JSON.parse(jsonText);
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`Imported "${result.campaignName}" (ID: ${result.campaignId})`);
        setTimeout(() => router.push(`/campaigns/${result.campaignId}`), 1500);
      } else {
        setStatus("error");
        setMessage(result.error || "Import failed");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Import failed: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-amber-400 mb-2">Import Campaign</h1>
      <p className="text-gray-500 mb-8">
        Upload an exported campaign JSON file to sync your local database with the team.
      </p>

      {/* File upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload JSON file
        </label>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-amber-500 file:text-gray-900
            hover:file:bg-amber-600
            file:cursor-pointer cursor-pointer"
        />
      </div>

      {/* Or paste JSON */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Or paste JSON directly
        </label>
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            try {
              const data = JSON.parse(e.target.value);
              if (data.campaign?.name && data.stages) {
                setMessage(`Parsed: "${data.campaign.name}" with ${data.stages.length} stages`);
                setStatus("idle");
              }
            } catch {
              // User is still typing
            }
          }}
          rows={12}
          placeholder='{"campaign": {"name": "..."}, "stages": [...]}'
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 font-mono focus:border-amber-500 focus:outline-none resize-y"
        />
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm ${
            status === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : status === "error"
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-gray-800 text-gray-300 border border-gray-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={!jsonText || status === "loading" || status === "error"}
        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-semibold rounded-lg transition-colors"
      >
        {status === "loading" ? "Importing..." : "Import to Database"}
      </button>

      {/* Instructions */}
      <div className="mt-10 p-5 bg-gray-900 border border-gray-800 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">How to sync with your team</h3>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>One team member edits the campaign on the dashboard</li>
          <li>Go to the campaign page and click <strong className="text-amber-400">Export JSON</strong></li>
          <li>Save the file as <code className="text-amber-400/80">game/config/campaign.json</code></li>
          <li>Commit and push to git</li>
          <li>Other team members pull, then come here and upload that JSON file</li>
          <li>The database will be updated with the imported campaign data</li>
        </ol>
      </div>
    </div>
  );
}
