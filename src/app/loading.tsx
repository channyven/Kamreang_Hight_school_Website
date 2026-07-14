export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">
          កំពុងផ្ទុក... / Loading...
        </p>
      </div>
    </div>
  );
}
