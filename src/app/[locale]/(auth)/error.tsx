"use client";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          មានបញ្ហាកើតឡើង
        </h1>
        <p className="text-lg text-gray-700 mb-1">Something went wrong</p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-4 px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: "#1e3a8a" }}
        >
          ព្យាយាមម្តងទៀត / Try again
        </button>
      </div>
    </div>
  );
}
