'use client';

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Key } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('agent@securemanager.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: 'Alex Rivera', role: 'Senior Support Lead', email });
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 relative z-10">
        {/* Header Branding */}
        <div className="p-8 bg-slate-900 text-white text-center space-y-3 relative">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-mono font-bold text-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            SM
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">SECURE MANAGER</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Ticket Classification & Operations Platform</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 font-mono">
                Agent Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="agent@securemanager.com"
                  className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-150 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Authenticating Agent...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Preset Quick Demo Login */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={handleSubmit}
              className="text-xs font-mono text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              ⚡ Quick Demo Sign In as Ops Agent
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="py-3 px-8 bg-slate-50 border-t border-slate-100 text-center text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Session • Safe Deposit Locker Operations</span>
        </div>
      </div>
    </div>
  );
}
