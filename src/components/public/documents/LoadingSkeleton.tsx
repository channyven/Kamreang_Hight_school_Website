/**
 * Loading skeleton displayed while documents are being fetched.
 * Renders 6 placeholder card shapes matching the DocumentCard layout.
 */
export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
        >
          {/* Icon + badge row */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="w-16 h-6 rounded-full bg-gray-100" />
          </div>

          {/* Title */}
          <div className="h-5 bg-gray-200 rounded w-full mb-2" />
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />

          {/* Description */}
          <div className="h-4 bg-gray-100 rounded w-full mb-1" />
          <div className="h-4 bg-gray-100 rounded w-5/6 mb-6" />

          {/* Divider */}
          <div className="border-t border-gray-100 my-3" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="w-9 h-9 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
