'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Bell, 
  Save, 
  Building2, 
  AlertTriangle,
  Info
} from 'lucide-react';

export default function SystemSettings({ settings, onSaveSettings }) {
  const [threshold, setThreshold] = useState(settings?.confidence_threshold || 0.70);
  const [autoRouting, setAutoRouting] = useState(settings?.auto_routing_enabled ?? true);
  const [keywordSafetyNet, setKeywordSafetyNet] = useState(settings?.keyword_safety_net ?? true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await onSaveSettings({
      confidence_threshold: parseFloat(threshold),
      auto_routing_enabled: autoRouting,
      keyword_safety_net: keywordSafetyNet
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const manualReductionPct = Math.round((1 - threshold) * 100);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0f131d]">
      {/* Header */}
      <header className="px-6 py-4 bg-[#161c2a] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            SYSTEM CONFIGURATION & GUARDRAILS
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Tune AI confidence cutoffs, safety nets, and society routing multipliers</p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Settings Saved!' : 'Save Configuration'}</span>
        </button>
      </header>

      <div className="p-6 max-w-4xl space-y-6">
        {/* Confidence Threshold Cutoff Slider Section */}
        <div className="bg-[#161c2a] p-6 rounded-lg border border-[rgba(255,255,255,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
            <div>
              <h2 className="label-caps text-gray-200 flex items-center gap-2 text-sm">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>AUTO-ROUTING CONFIDENCE THRESHOLD</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-sans">
                Classifications below this score automatically flag <strong className="text-amber-300">requires_human_review = true</strong>.
              </p>
            </div>

            <div className="text-right font-mono">
              <span className="text-2xl font-bold text-blue-400">{Math.round(threshold * 100)}%</span>
              <div className="text-[10px] text-gray-500">CURRENT CUTOFF</div>
            </div>
          </div>

          {/* Interactive Slider */}
          <div className="space-y-2 py-2">
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full h-2 bg-[#0a0e18] rounded-lg appearance-none cursor-pointer accent-blue-500 border border-[rgba(255,255,255,0.1)]"
            />
            <div className="flex justify-between font-mono text-[10px] text-gray-500">
              <span>50% (High Aggression)</span>
              <span>70% (Balanced Baseline)</span>
              <span>95% (Strict Caution)</span>
            </div>
          </div>

          {/* Live Impact Estimator Box */}
          <div className="p-4 bg-[#0a0e18] rounded border border-blue-500/30 flex items-start gap-3 font-mono text-xs">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-blue-300 font-bold">LIVE OPERATIONAL IMPACT ESTIMATE:</span>
              <p className="text-gray-300 font-sans text-xs mt-0.5">
                At a <strong className="text-white">{Math.round(threshold * 100)}% cutoff</strong>, approximately <strong className="text-emerald-400">{100 - manualReductionPct}%</strong> of queries will auto-route, yielding a <strong className="text-blue-400">~{manualReductionPct}% manual review reduction</strong> while enforcing human oversight on low-confidence cases.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Net Toggles */}
        <div className="bg-[#161c2a] p-6 rounded-lg border border-[rgba(255,255,255,0.08)] space-y-4">
          <h2 className="label-caps text-gray-200 flex items-center gap-2 text-sm border-b border-[rgba(255,255,255,0.08)] pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SAFETY NET & FAIL-SAFE RULES</span>
          </h2>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between p-3 bg-[#0a0e18] rounded border border-[rgba(255,255,255,0.05)]">
              <div>
                <div className="font-semibold text-white">Keyword Pre-Filter Safety Net</div>
                <div className="text-gray-400 text-[11px]">Force-escalate priority to URGENT if security or lockout keywords are detected</div>
              </div>
              <input
                type="checkbox"
                checked={keywordSafetyNet}
                onChange={(e) => setKeywordSafetyNet(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0e18] rounded border border-[rgba(255,255,255,0.05)]">
              <div>
                <div className="font-semibold text-white">Security Category Mandatory Review</div>
                <div className="text-gray-400 text-[11px]">Always set requires_human_review = true for security_concern queries regardless of LLM confidence</div>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-4 h-4 accent-blue-500 rounded cursor-not-allowed opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Notification Rules Table */}
        <div className="bg-[#161c2a] p-6 rounded-lg border border-[rgba(255,255,255,0.08)] space-y-4">
          <h2 className="label-caps text-gray-200 flex items-center gap-2 text-sm border-b border-[rgba(255,255,255,0.08)] pb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>NOTIFICATION MATRIX</span>
          </h2>

          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)] text-gray-400 text-[10px] label-caps">
                <th className="py-2 px-2">EVENT TYPE</th>
                <th className="py-2 px-2">THRESHOLD</th>
                <th className="py-2 px-2">CHANNEL</th>
                <th className="py-2 px-2">RECIPIENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              <tr>
                <td className="py-2.5 px-2 text-red-400 font-bold">security_concern</td>
                <td className="py-2.5 px-2 text-gray-300">Any Confidence</td>
                <td className="py-2.5 px-2 text-blue-400">PagerDuty + Slack</td>
                <td className="py-2.5 px-2 text-gray-300">#ops-critical-alerts</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 text-amber-400 font-bold">locker_access</td>
                <td className="py-2.5 px-2 text-gray-300">Priority == Urgent</td>
                <td className="py-2.5 px-2 text-blue-400">Slack Dispatch</td>
                <td className="py-2.5 px-2 text-gray-300">#field-oncall</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 text-gray-300 font-bold">sla_breach_warning</td>
                <td className="py-2.5 px-2 text-gray-300">&lt; 5m remaining</td>
                <td className="py-2.5 px-2 text-blue-400">Dashboard Telemetry</td>
                <td className="py-2.5 px-2 text-gray-300">Active Shift Lead</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
