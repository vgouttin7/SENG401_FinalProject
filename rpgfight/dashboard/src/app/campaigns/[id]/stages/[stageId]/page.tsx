"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import DialogueEditor from "@/components/editors/DialogueEditor";
import QuestionsEditor from "@/components/editors/QuestionsEditor";
import StageSettingsEditor from "@/components/editors/StageSettingsEditor";
import TileMapEditor from "@/components/editors/TileMapEditor";
import EnemiesEditor from "@/components/editors/EnemiesEditor";

type Tab = "settings" | "dialogue" | "questions" | "enemies" | "tilemap";

interface StageData {
  id: number;
  campaignId: number;
  stageNum: number;
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
  tileMap: number[][];
  dialogueLines: Array<{
    id: number;
    characterId: number;
    text: string;
    portrait: string;
    sortOrder: number;
    character: { id: number; name: string; color: string };
  }>;
  questions: Array<{
    id: number;
    text: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
    sortOrder: number;
  }>;
  stageEnemies: Array<{
    id: number;
    enemyTemplateId: number;
    minSpeed: number;
    maxSpeed: number;
    enemyTemplate: { id: number; name: string; displayName: string };
  }>;
  modifierPool: Array<{
    id: number;
    modifierDefId: number;
    modifierDef: { id: number; type: string; name: string; value: number; description: string; isPositive: boolean };
  }>;
}

export default function StageDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const stageId = params.stageId as string;

  const [stage, setStage] = useState<StageData | null>(null);
  const [tab, setTab] = useState<Tab>("settings");
  const [loading, setLoading] = useState(true);

  async function loadStage() {
    const res = await fetch(api(`/api/stages/${stageId}`));
    if (res.ok) {
      setStage(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadStage();
  }, [stageId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (!stage) return <div className="text-red-400">Stage not found</div>;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "settings", label: "Settings" },
    { key: "dialogue", label: "Dialogue", count: stage.dialogueLines.length },
    { key: "questions", label: "Questions", count: stage.questions.length },
    { key: "enemies", label: "Enemies", count: stage.stageEnemies.length },
    { key: "tilemap", label: "Tile Map" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-300">Campaigns</Link>
        <span>/</span>
        <Link href={`/campaigns/${campaignId}`} className="hover:text-gray-300">Campaign</Link>
        <span>/</span>
        <span className="text-gray-400">Stage {stage.stageNum}</span>
      </div>

      <h1 className="text-3xl font-bold text-amber-400 mb-1">{stage.eraName}</h1>
      <p className="text-gray-500 mb-6">Stage {stage.stageNum}</p>

      <div className="flex gap-1 mb-6 border-b border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              tab === t.key
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-800 rounded text-xs">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "settings" && <StageSettingsEditor stage={stage} onSave={loadStage} />}
      {tab === "dialogue" && <DialogueEditor stageId={stage.id} dialogueLines={stage.dialogueLines} onSave={loadStage} />}
      {tab === "questions" && <QuestionsEditor stageId={stage.id} questions={stage.questions} onSave={loadStage} />}
      {tab === "enemies" && <EnemiesEditor stageId={stage.id} stageEnemies={stage.stageEnemies} onSave={loadStage} />}
      {tab === "tilemap" && <TileMapEditor stageId={stage.id} tileMap={stage.tileMap} onSave={loadStage} />}
    </div>
  );
}
