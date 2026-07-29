'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  UserCheck, 
  ArrowUpRight,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function TriageQueue({ 
  tickets, 
  selectedTicket, 
  setSelectedTicket, 
  setActiveTab, 
  onOpenTestModal, 
  telemetry, 
  onRefresh,
  onUpdateTicket
}) {
  const [filterNeedsReview, setFilterNeedsReview] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tickets for Triage Queue (Strictly active/unresolved only — resolved tickets are completely removed)
  const filteredTickets = tickets.filter(t => {
    const status = (t.status || '').toLowerCase().trim();
    if (status === 'resolved' || status === 'closed') return false;
    if (filterNeedsReview && !t.requires_human_review) return false;
    if (priorityFilter !== 'all' && (t.priority || '').toLowerCase() !== priorityFilter) return false;
    if (categoryFilter !== 'all' && (t.category || '').toLowerCase() !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (t.title || '').toLowerCase().includes(q) ||
        (t.body || '').toLowerCase().includes(q) ||
        (t.id || '').toLowerCase().includes(q) ||
        (t.email_id || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityStyle = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'urgent':
        return { border: 'border-l-4 border-l-red-500', bg: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'URGENT' };
      case 'high':
        return { border: 'border-l-4 border-l-amber-500', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'HIGH' };
      case 'medium':
        return { border: 'border-l-4 border-l-blue-500', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', label: 'MEDIUM' };
      default:
        return { border: 'border-l-4 border-l-gray-600', bg: 'bg-gray-500/10 text-gray-400 border-gray-500/30', label: 'LOW' };
    }
  };

  const formatCategory = (cat) => {
    if (!cat) return 'UNKNOWN';
    return cat.replace(/_/g, ' ').toUpperCase();
  };

  const getConfidenceBadge = (confidence, requiresHumanReview) => {
    const pct = Math.round(confidence * 100);
    if (pct < 70 || requiresHumanReview) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>{pct}% REVIEW REQUIRED</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>{pct}% HIGH TRUST</span>
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f131d]">
      {/* Header bar */}
      <header className="px-6 py-4 bg-[#161c2a] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            TICKETS QUEUE
            <span className="text-xs font-mono font-normal text-gray-400 px-2 py-0.5 bg-[#0f131d] rounded border border-[rgba(255,255,255,0.08)]">
              {filteredTickets.length} ACTIVE
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time ticket classification and auto-routing engine</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2 bg-[#0f131d] hover:bg-[#1d2538] border border-[rgba(255,255,255,0.08)] rounded text-gray-300 text-xs flex items-center gap-1.5 transition-all"
            title="Refresh queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenTestModal}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Email</span>
          </button>
        </div>
      </header>

      {/* Main content grid: Left list + Right telemetry rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Ticket feed & filter bar */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-[rgba(255,255,255,0.08)]">
          {/* Filter Bar */}
          <div className="p-4 bg-[#0a0e18] border-b border-[rgba(255,255,255,0.08)] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* Needs Human Review High-Contrast Toggle */}
                <button
                  onClick={() => setFilterNeedsReview(!filterNeedsReview)}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center gap-2 border ${
                    filterNeedsReview
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-900/30'
                      : 'bg-[#161c2a] text-gray-400 border-[rgba(255,255,255,0.1)] hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>NEEDS HUMAN REVIEW</span>
                </button>

                {/* Priority Selector */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-[#161c2a] text-gray-300 text-xs border border-[rgba(255,255,255,0.1)] rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Category Selector */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#161c2a] text-gray-300 text-xs border border-[rgba(255,255,255,0.1)] rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="security_concern">Security Concern</option>
                  <option value="locker_access">Locker Access</option>
                  <option value="billing_payment">Billing & Payment</option>
                  <option value="account_kyc">Account & KYC</option>
                  <option value="facility_request">Facility Request</option>
                  <option value="feedback_other">Feedback & Other</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ticket title, body, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161c2a] text-xs text-white placeholder-gray-500 pl-8 pr-3 py-1.5 rounded border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Ticket Card List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[rgba(255,255,255,0.1)] rounded-lg bg-[#0a0e18]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <h3 className="text-sm font-semibold text-gray-300">No Tickets Found</h3>
                <p className="text-xs text-gray-500 mt-1">No tickets match the selected filters or all active queries have been resolved.</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const priorityStyle = getPriorityStyle(t.priority);
                const isSelected = selectedTicket?.id === t.id;
                const isUrgent = (t.priority || '').toLowerCase() === 'urgent';
                const isResolved = (t.status || '').toLowerCase() === 'resolved';

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicket(t);
                      setActiveTab('detail');
                    }}
                    className={`group relative bg-[#161c2a] hover:bg-[#1d2538] p-4 rounded-r border border-[rgba(255,255,255,0.08)] cursor-pointer transition-all duration-150 ${priorityStyle.border} ${
                      isUrgent ? 'scanline-urgent' : ''
                    } ${isSelected ? 'ring-1 ring-blue-500 bg-[#1d2538]' : ''}`}
                  >
                    {/* Top Row Badges & Metadata */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${priorityStyle.bg}`}>
                          {priorityStyle.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0f131d] text-gray-300 border border-[rgba(255,255,255,0.1)]">
                          {formatCategory(t.category)}
                        </span>
                        {getConfidenceBadge(t.confidence, t.requires_human_review)}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-blue-400 font-semibold">{t.id}</span>
                      </div>
                    </div>

                    {/* Ticket Title */}
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1 mb-1">
                      {t.title}
                    </h3>

                    {/* Ticket Body Excerpt */}
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
                      {t.body}
                    </p>

                    {/* Bottom Metadata & Hover Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.05)] text-[11px]">
                      <div className="flex items-center gap-3 font-mono text-gray-400">
                        <span>Society: <strong className="text-gray-300 font-sans">{t.society_name}</strong></span>
                        <span className="text-gray-600">•</span>
                        <span>Email ID: <span className="text-gray-300">{t.email_id}</span></span>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] font-mono text-blue-400 flex items-center gap-1 group-hover:underline">
                          Analyze & Route <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Rail: Agent Performance & Live Telemetry Feed */}
        <div className="w-80 bg-[#0a0e18] flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
            <h2 className="label-caps text-gray-400 mb-3 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>AGENT PERFORMANCE METRICS</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#161c2a] rounded border border-[rgba(255,255,255,0.08)]">
                <div className="text-[10px] text-gray-400 font-mono">AVG RESOLVE TIME</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">14.2 m</div>
                <div className="text-[9px] text-emerald-500 font-mono mt-0.5">↓ 3.8m faster than SLA</div>
              </div>
              <div className="p-3 bg-[#161c2a] rounded border border-[rgba(255,255,255,0.08)]">
                <div className="text-[10px] text-gray-400 font-mono">CLASSIFICATION ACCURACY</div>
                <div className="text-lg font-bold font-mono text-blue-400 mt-0.5">96.8%</div>
                <div className="text-[9px] text-blue-400/80 font-mono mt-0.5">Based on agent feedback</div>
              </div>
            </div>
          </div>

          {/* Telemetry Stream */}
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="label-caps text-gray-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>LIVE TELEMETRY FEED</span>
              </h2>
              <span className="text-[10px] font-mono text-gray-500">AUTO-SCROLL</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px] pr-1">
              {telemetry.map((log) => {
                let badgeColor = 'bg-gray-800 text-gray-300';
                if (log.level === 'warning') badgeColor = 'bg-amber-900/40 text-amber-300 border-amber-700/50';
                if (log.level === 'success') badgeColor = 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50';

                return (
                  <div key={log.id} className="p-2 rounded bg-[#161c2a]/80 border border-[rgba(255,255,255,0.05)] text-gray-300">
                    <div className="flex items-center justify-between text-[9px] text-gray-500 mb-1">
                      <span className={`px-1 rounded border text-[9px] ${badgeColor}`}>
                        {log.event_type}
                      </span>
                      <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-gray-300 leading-snug">{log.message}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Command Shortcuts Grid */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#070a10]">
            <div className="label-caps text-gray-500 mb-2">QUICK ACTIONS GRID</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button 
                onClick={() => {
                  const urgent = tickets.find(t => t.priority === 'urgent');
                  if (urgent) {
                    setSelectedTicket(urgent);
                    setActiveTab('detail');
                  }
                }}
                className="p-2 bg-[#161c2a] hover:bg-[#1d2538] border border-[rgba(255,255,255,0.08)] rounded text-left text-red-300 flex items-center justify-between font-mono"
              >
                <span>Urgent Priority</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
              <button 
                onClick={() => {
                  setFilterNeedsReview(true);
                }}
                className="p-2 bg-[#161c2a] hover:bg-[#1d2538] border border-[rgba(255,255,255,0.08)] rounded text-left text-amber-300 flex items-center justify-between font-mono"
              >
                <span>Needs Review</span>
                <ShieldAlert className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
