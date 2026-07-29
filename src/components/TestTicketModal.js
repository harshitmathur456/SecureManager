'use client';

import React, { useState } from 'react';
import { 
  X, 
  Minus, 
  Square, 
  ChevronDown, 
  Paperclip, 
  Link2, 
  Smile, 
  Image as ImageIcon, 
  Lock, 
  PenLine, 
  MoreVertical, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Triangle,
  Wand2
} from 'lucide-react';

export default function TestTicketModal({ isOpen, onClose, onTicketCreated }) {
  if (!isOpen) return null;

  const [toEmail, setToEmail] = useState('support@securemanager.io');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [ccEmail, setCcEmail] = useState('');
  const [bccEmail, setBccEmail] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [emailId, setEmailId] = useState(`em_${Math.floor(100000 + Math.random() * 900000)}`);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleQuickPreset = (preset) => {
    const newId = `em_${Math.floor(100000 + Math.random() * 900000)}`;
    setEmailId(newId);
    setResult(null);
    setError('');

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

  const handleClear = () => {
    setTitle('');
    setBody('');
    setCcEmail('');
    setBccEmail('');
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Please fill in both the subject and email body.');
      return;
    }

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col transition-all">
        {/* Gmail Style Header */}
        <div className="px-4 py-2.5 bg-[#f2f6fc] border-b border-gray-200/80 flex items-center justify-between select-none">
          <div className="text-sm font-medium text-[#051e42] flex items-center gap-2">
            <span>New Message</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <button 
              type="button" 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="p-1 hover:bg-gray-200/70 rounded text-gray-600 transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button" 
              className="p-1 hover:bg-gray-200/70 rounded text-gray-600 transition-colors"
              title="Expand"
            >
              <Square className="w-3 h-3" />
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1 hover:bg-gray-200/70 rounded text-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-col flex-1">
            {/* Quick Test Presets Bar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Presets:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('security')}
                  className="px-2.5 py-0.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-full font-medium text-[11px] transition-colors"
                >
                  Security Tamper
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('lockout')}
                  className="px-2.5 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-full font-medium text-[11px] transition-colors"
                >
                  Passcode Lockout
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('billing')}
                  className="px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-full font-medium text-[11px] transition-colors"
                >
                  Double Charge
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('hinglish')}
                  className="px-2.5 py-0.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-full font-medium text-[11px] transition-colors"
                >
                  Hinglish Jam
                </button>
              </div>
            </div>

            {/* To Line */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-500 font-normal text-sm w-8 shrink-0">To</span>
                <input
                  type="text"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="w-full outline-none text-gray-800 bg-transparent text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium shrink-0">
                {!showCc && (
                  <button 
                    type="button" 
                    onClick={() => setShowCc(true)}
                    className="hover:text-gray-800 hover:underline cursor-pointer"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button 
                    type="button" 
                    onClick={() => setShowBcc(true)}
                    className="hover:text-gray-800 hover:underline cursor-pointer"
                  >
                    Bcc
                  </button>
                )}
              </div>
            </div>

            {/* Optional CC line */}
            {showCc && (
              <div className="px-4 py-2 border-b border-gray-100 flex items-center text-sm">
                <span className="text-gray-500 font-normal text-sm w-8 shrink-0">Cc</span>
                <input
                  type="text"
                  placeholder="Recipients"
                  value={ccEmail}
                  onChange={(e) => setCcEmail(e.target.value)}
                  className="w-full outline-none text-gray-800 bg-transparent text-sm"
                />
              </div>
            )}

            {/* Optional BCC line */}
            {showBcc && (
              <div className="px-4 py-2 border-b border-gray-100 flex items-center text-sm">
                <span className="text-gray-500 font-normal text-sm w-8 shrink-0">Bcc</span>
                <input
                  type="text"
                  placeholder="Recipients"
                  value={bccEmail}
                  onChange={(e) => setBccEmail(e.target.value)}
                  className="w-full outline-none text-gray-800 bg-transparent text-sm"
                />
              </div>
            )}

            {/* Subject Line */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center text-sm">
              <input
                type="text"
                placeholder="Subject"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full outline-none text-gray-800 placeholder-gray-400 bg-transparent text-sm font-normal"
              />
            </div>

            {/* Body Textarea */}
            <div className="p-4 flex-1 min-h-[220px] flex flex-col">
              <textarea
                rows={8}
                placeholder=""
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-sm resize-none border-none p-0"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Result Toast / Classification Summary */}
            {result && (
              <div className="mx-4 mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Email Ingested & Classified Successfully!
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono text-[11px]">
                    {Math.round(result.confidence * 100)}% Confidence
                  </span>
                </div>
                <div className="text-emerald-900 text-[11px] flex items-center gap-3">
                  <span><strong>Ticket ID:</strong> {result.ticket_id}</span>
                  <span><strong>Category:</strong> {result.category}</span>
                  <span><strong>Priority:</strong> {result.priority}</span>
                </div>
              </div>
            )}

            {/* Footer Toolbar */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between rounded-b-xl">
              {/* Left Actions: Blue Send Split Button + Tool Icons */}
              <div className="flex items-center gap-3">
                {/* Blue Pill Send Button */}
                <div className="inline-flex rounded-full shadow-sm bg-[#0b57d0] hover:bg-[#094bb7] transition-all">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-5 py-2 text-white font-medium text-sm flex items-center gap-1.5 rounded-l-full hover:bg-black/10 transition-colors"
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <span>Send</span>
                    )}
                  </button>
                  <div className="w-[1px] bg-blue-400/40 my-1.5"></div>
                  <button
                    type="button"
                    className="px-2.5 py-2 text-white rounded-r-full hover:bg-black/10 transition-colors flex items-center justify-center"
                    title="More send options"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Toolbar Icons matching Image 2 */}
                <div className="flex items-center gap-0.5 text-gray-600">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors font-serif font-bold text-xs text-gray-700" title="Formatting options">
                    Aa
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="AI Assistant">
                    <Wand2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Attach files">
                    <Paperclip className="w-4 h-4 text-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Insert link">
                    <Link2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Insert emoji">
                    <Smile className="w-4 h-4 text-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Insert files using Drive">
                    <Triangle className="w-3.5 h-3.5 text-gray-600 fill-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Insert photo">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Toggle confidential mode">
                    <Lock className="w-4 h-4 text-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Insert signature">
                    <PenLine className="w-4 h-4 text-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="More options">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Right Action: Trash Icon */}
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Discard draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
