export default function MusySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title Skeleton */}
        <div className="text-center mb-12">
          <div className="h-20 bg-slate-700 rounded-lg mb-4 animate-pulse" />
          <div className="h-6 bg-slate-700 rounded w-3/4 mx-auto animate-pulse" />
        </div>

        {/* Icon Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 bg-slate-700 rounded-2xl animate-pulse shadow-lg shadow-cyan-500/20" />
        </div>

        {/* Play Button Skeleton */}
        <div className="flex justify-center mb-12">
          <div className="h-10 w-20 bg-slate-700 rounded-lg animate-pulse" />
        </div>

        {/* Song Info Skeleton */}
        <div className="text-center mb-12">
          <div className="h-8 bg-slate-700 rounded w-2/3 mx-auto mb-3 animate-pulse" />
          <div className="h-5 bg-slate-700 rounded w-1/2 mx-auto animate-pulse" />
        </div>

        {/* Microphone Icon Skeleton */}
        <div className="flex justify-center mb-12">
          <div className="h-20 w-20 bg-slate-700 rounded-full animate-pulse shadow-lg shadow-cyan-500/20" />
        </div>

        {/* Navigation Buttons Skeleton */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="h-10 w-12 bg-slate-700 rounded animate-pulse" />
          <div className="flex-1">
            <div className="h-5 bg-slate-700 rounded w-1/3 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-slate-700 rounded w-1/4 mx-auto animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-5 bg-slate-700 rounded w-1/3 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-slate-700 rounded w-1/4 mx-auto animate-pulse" />
          </div>
          <div className="h-10 w-12 bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Volume Slider Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-5 w-16 bg-slate-700 rounded animate-pulse" />
          <div className="flex-1 h-2 bg-slate-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
