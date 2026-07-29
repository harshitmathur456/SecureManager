import { supabase } from './supabaseClient';

// Database helper functions using Supabase Client

export async function getTickets(filters = {}) {
  let query = supabase.from('tickets').select('*');

  if (filters.requires_human_review === 'true') {
    query = query.eq('requires_human_review', true);
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    const s = `%${filters.search}%`;
    query = query.or(`title.ilike.${s},body.ilike.${s},id.ilike.${s},email_id.ilike.${s}`);
  }

  // Sort by recency by default
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTicketById(id) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data;
}

export async function saveTicket(ticket) {
  const { data, error } = await supabase
    .from('tickets')
    .upsert(ticket, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTicketStatus(id, updates) {
  const payload = { ...updates };
  if (updates.status === 'resolved' && !payload.resolved_at) {
    payload.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tickets')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  // Log telemetry event
  await logTelemetry({
    ticket_id: id,
    event_type: updates.corrected_category ? "AGENT_RECLASSIFICATION" : "TICKET_UPDATE",
    message: updates.corrected_category
      ? `Agent reclassified ticket ${id} to category '${updates.corrected_category}' (Priority: '${updates.corrected_priority || data.priority}')`
      : `Ticket ${id} status updated to '${updates.status}'`,
    level: "info"
  });

  return data;
}

export async function logTelemetry(entry) {
  const { data, error } = await supabase
    .from('telemetry')
    .insert({
      ticket_id: entry.ticket_id,
      event_type: entry.event_type,
      message: entry.message,
      level: entry.level || 'info'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTelemetry() {
  const { data, error } = await supabase
    .from('telemetry')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSettings(newSettings) {
  const { data, error } = await supabase
    .from('settings')
    .update(newSettings)
    .eq('id', 1)
    .select()
    .single();

  if (error) throw error;

  await logTelemetry({
    ticket_id: "SYSTEM",
    event_type: "SETTINGS_UPDATE",
    message: `System confidence threshold updated to ${(data.confidence_threshold * 100).toFixed(0)}%.`,
    level: "warning"
  });

  return data;
}

export async function calculateSlaDeadline(priority, createdAtDate = new Date()) {
  const settings = await getSettings();
  let minutes = 240; // Default medium 4 hours

  switch (priority.toLowerCase()) {
    case 'urgent':
      minutes = settings.urgent_sla_minutes || 15;
      break;
    case 'high':
      minutes = settings.high_sla_minutes || 60;
      break;
    case 'medium':
      minutes = settings.medium_sla_minutes || 240;
      break;
    case 'low':
      minutes = settings.low_sla_minutes || 1440;
      break;
  }

  return new Date(createdAtDate.getTime() + minutes * 60 * 1000).toISOString();
}
