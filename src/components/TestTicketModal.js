'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';

export default function TestTicketModal({ isOpen, onClose, onTicketCreated }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [emailId, setEmailId] = useState(`em_${Math.floor(100000 + Math.random() * 900000)}`);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleQuickPreset = (preset) => {
    switch (preset) {
      case 'security':
        setTitle('URGENT: Someone damaged lock bezel on Locker #104');
        setBody('I found fresh scratches and tamper marks on locker #104 in Block A basement. Keypad is non-responsive. Please inspect urgently!');
        break;
      case 'lockout':
        setTitle('Locked out of locker code error flight in 2 hours!');
        setBody('I am trying to retrieve my passport for my international flight. App says code failed. Please help urgent lockout!');
        break;
      case 'billing':
        setTitle('Double charge on monthly locker subscription #INV-499');
        setBody('My bank account shows two debits of ₹499 on July 25th for Secure Manager slot #202. Please issue a refund.');
        break;
      case 'hinglish':
        setTitle('Mere locker ka gate jam ho gaya hai door open nahi ho raha');
        setBody('Locker number 301 ka latch heavy ho gaya hai. Button press karte hi green light turns red. Fix kardo pls.');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, email_id: emailId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Classification failed');

      setResult(data);
      if (onTicketCreated) onTicketCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161c2a] border border-[rgba(255,255,255,0.1)] rounded-lg w-full max-w-xl overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0a0e18] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>TEST BACKEND API (`POST /api/classify`)</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Presets Bar */}
          <div>
            <div className="label-caps text-gray-400 mb-2">QUICK TEST PRESETS</div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => handleQuickPreset('security')}
                className="px-2.5 py-1 bg-red-950/40 border border-red-500/40 text-red-300 rounded font-mono hover:bg-red-900/50"
              >
                Security Tamper
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('lockout')}
                className="px-2.5 py-1 bg-amber-950/40 border border-amber-500/40 text-amber-300 rounded font-mono hover:bg-amber-900/50"
              >
                Passcode Lockout
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('billing')}
                className="px-2.5 py-1 bg-blue-950/40 border border-blue-500/40 text-blue-300 rounded font-mono hover:bg-blue-900/50"
              >
                Double Charge
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('hinglish')}
                className="px-2.5 py-1 bg-purple-950/40 border border-purple-500/40 text-purple-300 rounded font-mono hover:bg-purple-900/50"
              >
                Hinglish Jam
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
            <div>
              <label className="text-[10px] font-mono text-gray-400 block mb-1">EMAIL ID</label>
              <input
                type="text"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="w-full bg-[#0a0e18] text-white p-2 rounded border border-[rgba(255,255,255,0.1)] font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-gray-400 block mb-1">EMAIL SUBJECT / TITLE</label>
              <input
                type="text"
                placeholder="e.g. Can't unlock door 204"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#0a0e18] text-white p-2 rounded border border-[rgba(255,255,255,0.1)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-gray-400 block mb-1">EMAIL BODY PAYLOAD</label>
              <textarea
                rows={4}
                placeholder="Paste customer query body text here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="w-full bg-[#0a0e18] text-white p-2 rounded border border-[rgba(255,255,255,0.1)]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <span>Executing Hybrid AI Engine...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute POST /api/classify</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded font-mono">
              Error: {error}
            </div>
          )}

          {/* Classification API Output Preview */}
          {result && (
            <div className="p-4 bg-[#0a0e18] border border-emerald-500/40 rounded space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-[rgba(255,255,255,0.08)] pb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  API RESPONSE (201 CREATED)
                </span>
                <span>{Math.round(result.confidence * 100)}% CONFIDENCE</span>
              </div>

              <pre className="text-[11px] text-gray-300 bg-[#070a10] p-3 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>

              <div className="text-[10px] text-gray-400 font-sans italic">
                Ticket automatically persisted to database & surfaced on Triage Queue.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
