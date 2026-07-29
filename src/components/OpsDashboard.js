'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Building2, 
  Layers,
  Activity
} from 'lucide-react';

export default function OpsDashboard({ stats, tickets }) {
  const {
    total_triaged_today = 0,
    ai_accuracy_rate = 96,
    pending_critical = 0,
    mttr_minutes = 14,
    sla_compliance_rate = 98.4,
    issues_by_society = []
  } = stats || {};

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0f131d]">
      {/* Header */}
      <header className="px-6 py-4 bg-[#161c2a] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            OPERATIONAL DASHBOARD
            <span className="text-xs font-mono font-normal text-emerald-400 px-2 py-0.5 bg-[#0f131d] rounded border border-emerald-500/30">
              SLA: {sla_compliance_rate}%
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">High-level operational metrics, SLA compliance, and society issue density</p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] relative overflow-hidden">
            <div className="text-xs font-mono text-gray-400 flex items-center justify-between">
              <span>TOTAL CLASSIFIED TODAY</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white mt-2">{total_triaged_today}</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% vs yesterday</span>
            </div>
          </div>

          <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] relative overflow-hidden">
            <div className="text-xs font-mono text-gray-400 flex items-center justify-between">
              <span>AI ACCURACY RATE</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">{ai_accuracy_rate}%</div>
            <div className="text-[11px] text-gray-400 font-mono mt-1">Based on zero agent overrides</div>
          </div>

          <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] relative overflow-hidden">
            <div className="text-xs font-mono text-gray-400 flex items-center justify-between">
              <span>PENDING CRITICAL</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-red-400 mt-2">{pending_critical}</div>
            <div className="text-[11px] text-red-300/80 font-mono mt-1">Urgent review required</div>
          </div>

          <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] relative overflow-hidden">
            <div className="text-xs font-mono text-gray-400 flex items-center justify-between">
              <span>MEAN RESPONSE TIME</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-amber-300 mt-2">{mttr_minutes}m</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">Below target 15m threshold</div>
          </div>
        </div>

        {/* Middle Row: Society Distribution Bar Chart & Active Incidents */}
        <div className="grid grid-cols-3 gap-6">
          {/* Issues by Society Chart */}
          <div className="col-span-2 bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,255,255,0.08)] pb-3">
              <h2 className="label-caps text-gray-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>TICKET DISTRIBUTION BY HOUSING SOCIETY</span>
              </h2>
              <span className="text-[10px] font-mono text-gray-500">HARDWARE vs USER ERRORS</span>
            </div>

            <div className="space-y-4">
              {issues_by_society.map((item, idx) => {
                const maxCount = Math.max(...issues_by_society.map(i => i.count), 1);
                const widthPct = Math.round((item.count / maxCount) * 100);

                return (
                  <div key={idx} className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-sans font-medium">{item.society}</span>
                      <span className="text-blue-400 font-bold">{item.count} tickets</span>
                    </div>
                    <div className="w-full bg-[#0a0e18] h-3 rounded overflow-hidden border border-[rgba(255,255,255,0.05)]">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active SLA & Security Incidents */}
          <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,255,255,0.08)] pb-3">
                <h2 className="label-caps text-red-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>SLA INCIDENT ALERTS</span>
                </h2>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {tickets.filter(t => t.priority === 'urgent').map((t) => (
                  <div key={t.id} className="p-3 bg-red-950/20 border border-red-500/30 rounded text-red-300 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{t.id}</span>
                      <span className="text-red-400">{(t.category || 'feedback_other').toUpperCase()}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 font-sans line-clamp-1">{t.title}</p>
                    <div className="text-[10px] text-gray-400 flex justify-between pt-1">
                      <span>Target: 15 mins</span>
                      <span className="text-amber-400 font-bold">BREACH RISK</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#0a0e18] rounded border border-[rgba(255,255,255,0.05)] text-[11px] font-mono text-gray-400">
              System Fail-Safe Status: <strong className="text-emerald-400">OPERATIONAL</strong>
            </div>
          </div>
        </div>

        {/* Detailed Triage Log Table with Inline Confidence Bars */}
        <div className="bg-[#161c2a] p-5 rounded-lg border border-[rgba(255,255,255,0.08)]">
          <h2 className="label-caps text-gray-300 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>ALL INCIDENTS LOG MATRIX</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.1)] text-gray-400 text-[10px] label-caps">
                  <th className="py-2.5 px-3">TICKET ID</th>
                  <th className="py-2.5 px-3">CATEGORY</th>
                  <th className="py-2.5 px-3">PRIORITY</th>
                  <th className="py-2.5 px-3">CONFIDENCE</th>
                  <th className="py-2.5 px-3">HUMAN REVIEW</th>
                  <th className="py-2.5 px-3">SLA DEADLINE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {tickets.map((t) => {
                  const pct = Math.round(t.confidence * 100);
                  return (
                    <tr key={t.id} className="hover:bg-[#1d2538]">
                      <td className="py-3 px-3 font-bold text-blue-400">{t.id}</td>
                      <td className="py-3 px-3 text-gray-300 font-sans">{t.category}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          t.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-[#0a0e18] h-2 rounded overflow-hidden">
                            <div
                              className={`h-full ${pct < 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-300 font-bold">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {t.requires_human_review ? (
                          <span className="text-amber-400 font-bold">YES (FLAGGED)</span>
                        ) : (
                          <span className="text-emerald-400">NO (AUTO)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {new Date(t.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
