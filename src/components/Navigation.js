'use client';

import React from 'react';
import { 
  Inbox, 
  FileText, 
  BarChart3, 
  Sliders, 
  PlusCircle,
  LogOut
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, onOpenTestModal, pendingHumanReviewCount, user, onLogout }) {
  const navItems = [
    { id: 'queue', label: 'Ticket Queue', icon: Inbox, badge: pendingHumanReviewCount > 0 ? pendingHumanReviewCount : null },
    { id: 'detail', label: 'Detail Analysis', icon: FileText },
    { id: 'dashboard', label: 'Ops Dashboard', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-[#0a0e18] border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-blue-900/30">
              SM
            </div>
            <div>
              <div className="font-bold text-white tracking-wide text-sm flex items-center gap-1.5">
                SECURE MANAGER
              </div>
              <div className="text-[11px] text-gray-400 font-mono">Support Operations</div>
            </div>
          </div>
        </div>

        {/* Action Button: Test API Classifier */}
        <div className="p-3">
          <button
            onClick={onOpenTestModal}
            className="w-full py-2.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 hover:border-blue-400 text-blue-300 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>Test API Classify</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-white border-l-2 border-blue-500 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#161c2a]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Engine Status Footer */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#070a10] space-y-3">
        {/* User Card */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs font-mono">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="truncate max-w-[110px]">
              <div className="font-semibold text-gray-200 truncate text-[11px]">{user?.name || 'Alex Rivera'}</div>
              <div className="text-[10px] text-gray-400 font-mono truncate">{user?.role || 'Ops Agent'}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Status (Threshold removed per request) */}
        <div className="pt-2 border-t border-[rgba(255,255,255,0.05)] font-mono text-[11px] text-gray-400 space-y-1">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-gray-400">
            <span>ENGINE STATUS</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ACTIVE
            </span>
          </div>
          <div className="flex justify-between">
            <span>Safety Net:</span>
            <span className="text-blue-400 font-semibold">ONLINE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
