"use client";

export default function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          {/* Logo skeleton */}
          <div className="mb-8 h-8 animate-pulse rounded bg-gray-200" />

          {/* Navigation items skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Content Area Skeleton */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="space-y-6">
            {/* Title skeleton */}
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((card) => (
                <div key={card} className="rounded-lg bg-white p-6 shadow">
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-3 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart skeleton */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="space-y-4">
                <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-64 animate-pulse rounded bg-gray-200" />
              </div>
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 p-6">
                <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="flex items-center space-x-4">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                      </div>
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
