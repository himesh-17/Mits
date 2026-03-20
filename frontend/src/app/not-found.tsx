"use client";


export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-sky-900 mb-2">404</h1>

        <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>

        <p className="text-gray-500 text-sm mb-6">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a>
            href="/"
            className="bg-sky-500 text-white px-5 py-2 rounded-lg hover:bg-sky-600 transition font-medium"
          
            Go to Home
          </a>

          <a
            href="/login"
            className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}