export default function DownloadPage() {
  const builds = [
    {
      platform: "Windows",
      file: "ChroniclesOfChange-1.2-pc.zip",
      icon: "M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z",
      size: "319 MB",
    },
    {
      platform: "macOS",
      file: "ChroniclesOfChange-1.2-mac.zip",
      icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7",
      size: "315 MB",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-400">Download Game</h1>
        <p className="text-gray-500 mt-1">
          Download Chronicles of Change v1.2 for your platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
        {builds.map((build) => (
          <a
            key={build.platform}
            href={`/downloads/${build.file}`}
            className="block bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-amber-500/50 transition-colors text-center group"
          >
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-500 group-hover:text-amber-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={build.icon}
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-100 mb-1">
              {build.platform}
            </h2>
            <p className="text-gray-500 text-sm mb-4">{build.size}</p>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </span>
          </a>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-xl max-w-3xl">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          Installation
        </h3>
        <ol className="text-sm text-gray-500 space-y-1 list-decimal list-inside">
          <li>Download the zip file for your platform</li>
          <li>Extract the zip file</li>
          <li>Run the executable inside the extracted folder</li>
        </ol>
      </div>
    </div>
  );
}
