'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import TriageQueue from '@/components/TriageQueue';
import DetailAnalysis from '@/components/DetailAnalysis';
import OpsDashboard from '@/components/OpsDashboard';
import SystemSettings from '@/components/SystemSettings';
import TestTicketModal from '@/components/TestTicketModal';
import LoginPage from '@/components/LoginPage';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('queue');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [stats, setStats] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Fetch tickets, stats, telemetry
  const fetchData = async () => {
    try {
      const ts = Date.now();
      const [ticketsRes, statsRes, settingsRes] = await Promise.all([
        fetch(`/api/tickets?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/stats?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/settings?t=${ts}`, { cache: 'no-store' })
      ]);

      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();
      const settingsData = await settingsRes.json();

      setTickets(ticketsData.tickets || []);
      setStats(statsData);
      setTelemetry(statsData.telemetry || []);
      setSettings(settingsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleUpdateTicket = async (id, updates) => {
    try {
      console.log(`[DEBUG] Updating ticket ${id} with payload:`, updates);
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      console.log(`[DEBUG] API Response for ticket ${id}:`, updated);
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
      if (updates.status === 'resolved') {
        setSelectedTicket(null);
      } else {
        setSelectedTicket(updated);
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const updated = await res.json();
      setSettings(updated);
      await fetchData();
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Shared filter states for Triage Queue
  const [filterNeedsReview, setFilterNeedsReview] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  // Render Login Page if not authenticated
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(agentUser) => {
          setUser(agentUser);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // Filter logic shared between components
  const filteredTickets = tickets.filter(t => {
    const status = (t.status || '').toLowerCase().trim();
    if (!showResolved && (status === 'resolved' || status === 'closed')) return false;
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

  const displayCount = filteredTickets.length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f131d]">
      {/* Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        pendingHumanReviewCount={displayCount}
        user={user}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'queue' && (
          <TriageQueue
            tickets={tickets}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
            setActiveTab={setActiveTab}
            onOpenTestModal={() => setIsTestModalOpen(true)}
            telemetry={telemetry}
            onRefresh={fetchData}
            onUpdateTicket={handleUpdateTicket}
            // Lifted filter props
            filterNeedsReview={filterNeedsReview}
            setFilterNeedsReview={setFilterNeedsReview}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showResolved={showResolved}
            setShowResolved={setShowResolved}
            filteredTickets={filteredTickets}
          />
        )}

        {activeTab === 'detail' && (
          <DetailAnalysis
            ticket={selectedTicket || tickets[0]}
            onBack={() => setActiveTab('queue')}
            onUpdateTicket={handleUpdateTicket}
          />
        )}

        {activeTab === 'dashboard' && (
          <OpsDashboard
            stats={stats}
            tickets={tickets}
          />
        )}

        {activeTab === 'settings' && (
          <SystemSettings
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Interactive API Tester Popup */}
      <TestTicketModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onTicketCreated={fetchData}
      />
    </div>
  );
}
