'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="bg-[#0f131d] text-white flex items-center justify-center min-h-screen p-6 font-sans">
        <div className="bg-[#161c2a] p-8 rounded-xl border border-red-500/30 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold font-mono">
            !
          </div>
          <h2 className="text-lg font-bold text-white">System Error</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            {error?.message || 'A global error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
          >
            Reset App
          </button>
        </div>
      </body>
    </html>
  );
}
