import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: { stages: { orderBy: { stageNum: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Campaigns</h1>
          <p className="text-gray-500 mt-1">Manage your game campaigns and stages</p>
        </div>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No campaigns yet</p>
          <p className="text-sm mt-2">Create your first campaign to get started</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">{campaign.name}</h2>
                  <p className="text-gray-500 mt-1 text-sm">{campaign.description}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {campaign.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4 flex gap-4 flex-wrap">
                <span className="text-sm text-gray-400">
                  {campaign.stages.length} stage{campaign.stages.length !== 1 ? "s" : ""}
                </span>
                {campaign.stages.map((stage) => (
                  <span
                    key={stage.id}
                    className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400"
                  >
                    {stage.eraName}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
