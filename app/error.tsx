'use client'; // Error components must be Client components

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset = () => { window.location.reload() } }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Something went wrong!
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
