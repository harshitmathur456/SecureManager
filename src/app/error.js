'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f131d] text-white flex items-center justify-center p-6">
      <div className="bg-[#161c2a] p-8 rounded-xl border border-red-500/30 max-w-md text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold font-mono">
          !
        </div>
        <h2 className="text-lg font-bold text-white">Something went wrong</h2>
        <p className="text-xs text-gray-400 font-sans leading-relaxed">
          {error?.message || 'An unexpected error occurred in the application.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-all"
        >
          Try Reloading Page
        </button>
      </div>
    </div>
  );
}
