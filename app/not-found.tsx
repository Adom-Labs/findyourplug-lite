import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-12 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
          >
            Return Home
          </Link>
          <button
            className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
