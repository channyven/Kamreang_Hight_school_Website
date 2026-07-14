import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold mb-4" style={{ color: "#1e3a8a" }}>
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ទំព័រនេះរកមិនឃើញ
        </h1>
        <p className="text-lg text-gray-700 mb-6">Page not found</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: "#1e3a8a" }}
        >
          ត្រឡប់ទៅទំព័រដើម / Back to Home
        </Link>
      </div>
    </div>
  );
}
