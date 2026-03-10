import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id: parseInt(id) },
    include: {
      stages: {
        orderBy: { stageNum: "asc" },
        include: {
          dialogueLines: { select: { id: true } },
          questions: { select: { id: true } },
          stageEnemies: { include: { enemyTemplate: true } },
        },
      },
    },
  });

  if (!campaign) return notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">&larr; Campaigns</Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">{campaign.name}</h1>
          <p className="text-gray-500 mt-1">{campaign.description}</p>
        </div>
        <a
          href={`/api/export/${campaign.id}`}
          target="_blank"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Export JSON
        </a>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Stages</h2>
        <Link
          href={`/campaigns/${campaign.id}/stages/new`}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors text-sm"
        >
          + Add Stage
        </Link>
      </div>

      {campaign.stages.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
          <p>No stages yet. Add your first stage to begin building this campaign.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaign.stages.map((stage) => (
            <Link
              key={stage.id}
              href={`/campaigns/${campaign.id}/stages/${stage.id}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 flex items-center justify-center bg-amber-500/20 text-amber-400 font-bold rounded-lg text-lg">
                    {stage.stageNum}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-100">{stage.eraName}</h3>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>{stage.dialogueLines.length} dialogue lines</span>
                      <span>{stage.questions.length} questions</span>
                      <span>{stage.stageEnemies.length} enemy types</span>
                      <span>{stage.roundTime}s timer</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {stage.requiresStomp && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Stomp</span>
                  )}
                  {stage.stageEnemies.map((se) => (
                    <span key={se.id} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                      {se.enemyTemplate.displayName}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
