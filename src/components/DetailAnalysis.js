'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ArrowLeft, 
  RefreshCw, 
  Send, 
  Edit3, 
  Check, 
  FileText, 
  MapPin, 
  Box, 
  User, 
  Lock, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function DetailAnalysis({ ticket, onBack, onUpdateTicket }) {
  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-[#0f131d]">
        <div className="text-center space-y-3">
          <FileText className="w-12 h-12 text-gray-600 mx-auto opacity-50" />
          <h3 className="text-base font-semibold text-gray-300">No Ticket Selected</h3>
          <p className="text-xs text-gray-500">Select a ticket from the Triage Queue to perform deep-dive analysis.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-500 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Triage Queue</span>
          </button>
        </div>
      </div>
    );
  }

  const [isReclassifying, setIsReclassifying] = useState(false);
  const [newCategory, setNewCategory] = useState(ticket?.category || 'feedback_other');
  const [newPriority, setNewPriority] = useState(ticket?.priority || 'low');
  const [agentNotes, setAgentNotes] = useState(ticket?.agent_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const isResolved = (ticket?.status || '').toLowerCase() === 'resolved' || (ticket?.status || '').toLowerCase() === 'closed';
  const confidencePct = Math.round((ticket?.confidence ?? 0.85) * 100);
  const isLowConfidence = confidencePct < 70 || Boolean(ticket?.requires_human_review);

  const handleSaveReclassification = async () => {
    setIsSaving(true);
    await onUpdateTicket(ticket.id, {
      corrected_category: newCategory !== ticket.category ? newCategory : undefined,
      corrected_priority: newPriority !== ticket.priority ? newPriority : undefined,
      category: newCategory,
      priority: newPriority,
      requires_human_review: false,
      status: 'acknowledged',
      agent_notes: agentNotes
    });
    setIsSaving(false);
    setIsReclassifying(false);
    if (onBack) onBack();
  };

  const handleApproveRouting = async () => {
    setIsSaving(true);
    await onUpdateTicket(ticket.id, {
      requires_human_review: false,
      status: 'in_progress',
      agent_notes: 'Ops agent approved AI routing decision.'
    });
    setIsSaving(false);
    if (onBack) onBack();
  };

  const handleResolve = async () => {
    setIsSaving(true);
    await onUpdateTicket(ticket.id, {
      status: 'resolved',
      requires_human_review: false
    });
    setIsSaving(false);
    if (onBack) onBack();
  };

  const handleEscalate = async () => {
    setIsSaving(true);
    await onUpdateTicket(ticket.id, {
      status: 'escalated',
      priority: 'urgent',
      requires_human_review: true,
      agent_notes: 'Escalated directly to Senior Engineering Lead.'
    });
    setIsSaving(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f131d]">
      {/* Header bar */}
      <header className="px-6 py-4 bg-[#161c2a] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-[#0f131d] hover:bg-[#1d2538] border border-[rgba(255,255,255,0.08)] rounded text-gray-300 transition-colors"
            title="Back to queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-blue-400">{ticket.id}</span>
              <span className="text-gray-500 font-mono text-xs">|</span>
              <span className="font-mono text-xs text-gray-300">{ticket.email_id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>
                STATUS: {ticket.status}
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-wide mt-0.5 line-clamp-1">{ticket.title}</h1>
          </div>
        </div>

        {/* SLA Deadline Tracker */}
        <div className="flex items-center gap-3 bg-[#0a0e18] px-3 py-1.5 rounded border border-[rgba(255,255,255,0.08)] font-mono text-xs">
          <Clock className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[9px] text-gray-400">SLA TARGET DEADLINE</div>
            <div className="text-gray-200 font-bold text-[11px]">
              {new Date(ticket.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </header>

      {/* Resolved Banner — prominent full-width alert when viewing a resolved ticket */}
      {isResolved && (
        <div className="px-6 py-3 bg-emerald-900/30 border-b border-emerald-500/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-sm font-bold text-emerald-300 font-mono">TICKET RESOLVED</span>
            <span className="text-xs text-emerald-400/70 ml-3">This ticket has been resolved and removed from the active queue. You are viewing it in read-only audit mode.</span>
          </div>
          <button
            onClick={onBack}
            className="ml-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-all"
          >
            ← Back to Queue
          </button>
        </div>
      )}

      {/* Main Grid: Left payload + Right AI analysis engine */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Email Payload & Metadata */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto border-r border-[rgba(255,255,255,0.08)] space-y-6">
          {/* Metadata Card */}
          <div className="bg-[#161c2a] p-4 rounded-lg border border-[rgba(255,255,255,0.08)] font-mono text-xs space-y-2">
            <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-2">
              <span className="text-gray-400">TIMESTAMP:</span>
              <span className="text-gray-200">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-2">
              <span className="text-gray-400">HOUSING SOCIETY:</span>
              <span className="text-blue-300 font-bold">{ticket.society_name}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-2">
              <span className="text-gray-400">ROUTE KEY:</span>
              <span className="text-emerald-400">support.ingest.production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">EMAIL ID:</span>
              <span className="text-gray-300">{ticket.email_id}</span>
            </div>
          </div>

          {/* Raw Email Payload */}
          <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] space-y-3">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2">
              <h2 className="label-caps text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>ORIGINAL CUSTOMER EMAIL PAYLOAD</span>
              </h2>
              <span className="text-[10px] font-mono text-gray-500">RAW UNMODIFIED</span>
            </div>
            <h3 className="text-sm font-bold text-white">{ticket.title}</h3>
            <div className="p-4 bg-[#0a0e18] rounded border border-[rgba(255,255,255,0.05)] text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">
              {ticket.body}
            </div>
          </div>

          {/* Extracted Entities Matrix */}
          <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] space-y-3">
            <h2 className="label-caps text-gray-300 flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span>EXTRACTED ENTITIES MATRIX</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#0a0e18] rounded border border-[rgba(255,255,255,0.05)] flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-[10px] text-gray-500">LOCATION / ZONE</div>
                  <div className="text-gray-200 font-semibold">{ticket.extracted_location}</div>
                </div>
              </div>
              <div className="p-3 bg-[#0a0e18] rounded border border-[rgba(255,255,255,0.05)] flex items-center gap-3">
                <Lock className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-gray-500">ASSET / LOCKER ID</div>
                  <div className="text-gray-200 font-semibold">{ticket.extracted_asset_id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit & Override History */}
          {ticket.corrected_category && (
            <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30 text-xs font-mono space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>HUMAN RECLASSIFICATION OVERRIDE RECORDED</span>
              </div>
              <p className="text-amber-200/80">
                Agent override category to <strong className="text-white">{ticket.corrected_category}</strong> (Priority: {ticket.corrected_priority || ticket.priority}). This record will feed into the prompt eval dataset.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: AI Triage Decision & Control Center */}
        <div className="w-96 bg-[#0a0e18] p-6 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            {/* AI Circular Confidence Gauge */}
            <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] flex flex-col items-center text-center">
              <div className="label-caps text-gray-400 mb-3">AI CLASSIFICATION CONFIDENCE</div>
              
              {/* SVG Circular Meter */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isLowConfidence ? 'text-amber-400' : 'text-emerald-400'}
                    strokeDasharray={`${confidencePct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold font-mono text-white">{confidencePct}%</span>
                  <span className={`text-[9px] font-mono font-bold tracking-wider uppercase ${isLowConfidence ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isLowConfidence ? 'LOW TRUST' : 'HIGH TRUST'}
                  </span>
                </div>
              </div>

              {isLowConfidence && (
                <div className="mt-3 p-2 bg-amber-500/10 rounded border border-amber-500/20 text-[10px] text-amber-300 font-mono">
                  ⚠ System cutoff triggered human review requirement.
                </div>
              )}
            </div>

            {/* AI Classification & Rationale */}
            <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] space-y-3 font-sans">
              <div className="label-caps text-gray-400">CLASSIFICATION ENGINE SUMMARY</div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">CATEGORY:</span>
                  <span className="font-bold text-blue-300 font-mono px-2 py-0.5 bg-[#0f131d] rounded border border-[rgba(255,255,255,0.1)]">
                    {(ticket?.category || 'feedback_other').replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">PRIORITY TIER:</span>
                  <span className={`font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                    ticket?.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {(ticket?.priority || 'low').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[rgba(255,255,255,0.05)]">
                <div className="text-[10px] text-gray-400 font-mono mb-1">RECOMMENDED ACTION:</div>
                <p className="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded border border-emerald-500/20 font-medium">
                  {ticket.suggested_action}
                </p>
              </div>

              <div>
                <div className="text-[10px] text-gray-400 font-mono mb-1">REASONING RATIONALE:</div>
                <p className="text-xs text-gray-300 italic bg-[#0a0e18] p-2.5 rounded border border-[rgba(255,255,255,0.05)]">
                  "{ticket.reasoning}"
                </p>
              </div>
            </div>

            {/* Reclassify Form toggle */}
            {isReclassifying && (
              <div className="bg-[#161c2a] p-4 rounded-lg border border-blue-500/40 space-y-3 font-sans">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <span>OVERRIDE AI CLASSIFICATION</span>
                </h3>

                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">CORRECT CATEGORY</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#0a0e18] text-white p-2 rounded border border-[rgba(255,255,255,0.1)]"
                    >
                      <option value="security_concern">security_concern</option>
                      <option value="locker_access">locker_access</option>
                      <option value="billing_payment">billing_payment</option>
                      <option value="account_kyc">account_kyc</option>
                      <option value="facility_request">facility_request</option>
                      <option value="feedback_other">feedback_other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">CORRECT PRIORITY</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full bg-[#0a0e18] text-white p-2 rounded border border-[rgba(255,255,255,0.1)]"
                    >
                      <option value="urgent">urgent</option>
                      <option value="high">high</option>
                      <option value="medium">medium</option>
                      <option value="low">low</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">AGENT RATIONALE NOTES</label>
                    <textarea
                      rows={2}
                      value={agentNotes}
                      onChange={(e) => setAgentNotes(e.target.value)}
                      placeholder="Why is this ticket being reclassified?"
                      className="w-full bg-[#0a0e18] text-white p-2 rounded border border-[rgba(255,255,255,0.1)] font-sans"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveReclassification}
                    disabled={isSaving}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-all"
                  >
                    Save & Retrain Feedback
                  </button>
                  <button
                    onClick={() => setIsReclassifying(false)}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Command Bar */}
          <div className={`space-y-2 pt-4 border-t border-[rgba(255,255,255,0.08)] ${isResolved ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="label-caps text-gray-500 mb-2">{isResolved ? 'OPS ACTION BAR (READ-ONLY)' : 'OPS ACTION BAR'}</div>
            
            <button
              onClick={handleApproveRouting}
              disabled={isSaving || isResolved}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve AI Routing</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsReclassifying(!isReclassifying)}
                disabled={isResolved}
                className="py-2 px-3 bg-[#161c2a] hover:bg-[#1d2538] border border-[rgba(255,255,255,0.1)] text-blue-300 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Re-classify</span>
              </button>

              <button
                onClick={handleEscalate}
                disabled={isSaving || isResolved}
                className="py-2 px-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Escalate Admin</span>
              </button>
            </div>

            <button
              onClick={handleResolve}
              disabled={isSaving || isResolved}
              className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-semibold transition-all mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResolved ? '✓ Already Resolved' : 'Mark Ticket Resolved'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
