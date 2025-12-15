import { Skeleton } from "../ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-zinc-800" />
                    <Skeleton className="h-4 w-64 bg-zinc-800" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32 bg-zinc-800" />
                    <Skeleton className="h-10 w-32 bg-zinc-800" />
                </div>
            </div>

            {/* AI Insights Skeleton */}
            <Skeleton className="h-32 w-full rounded-2xl bg-zinc-800" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl bg-zinc-800" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Skeleton */}
                <div className="lg:col-span-2">
                    <Skeleton className="h-[400px] rounded-2xl bg-zinc-800" />
                </div>

                {/* Live Feed Skeleton */}
                <div className="h-[480px] rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 space-y-2">
                        <Skeleton className="h-6 w-40 bg-zinc-800" />
                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                    </div>
                    <div className="flex-1 p-4 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                                    <Skeleton className="h-3 w-1/2 bg-zinc-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
