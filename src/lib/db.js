import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'lockbox_store.json');

const INITIAL_SEED_TICKETS = [
  {
    id: "TCK-9401",
    email_id: "em_849201",
    title: "URGENT: Physical tampering detected on Locker #302",
    body: "Hi Secure Manager team, I walked down to our society locker bank in Block B and noticed scratches and tool marks around the lock bezel of locker #302. The keypad response is lagging. Please inspect immediately as my valuables are stored inside.",
    category: "security_concern",
    priority: "urgent",
    confidence: 0.96,
    suggested_action: "Dispatch field engineer immediately & notify security lead for physical inspection.",
    reasoning: "Subject and body contain clear indicators of physical tampering and potential security breach on a locker asset.",
    requires_human_review: true,
    status: "pending",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 0 * 60 * 1000).toISOString(), // Breaching now
    resolved_at: null,
    corrected_category: null,
    corrected_priority: null,
    agent_notes: null,
    society_name: "Oakridge Greens",
    extracted_location: "Block B Locker Bank, Basement 1",
    extracted_asset_id: "LCK-302-B"
  },
  {
    id: "TCK-9402",
    email_id: "em_849202",
    title: "Locked out! App code not generating and passport inside",
    body: "I am at the locker right now trying to retrieve my passport for an early morning flight. The app says 'Connection Error' when generating OTP code. Please help me unlock it urgent!",
    category: "locker_access",
    priority: "urgent",
    confidence: 0.92,
    suggested_action: "Trigger remote master override after verifying resident KYC phone prompt.",
    reasoning: "User is physically stranded at locker with time-sensitive access failure (passport retrieval for flight).",
    requires_human_review: false,
    status: "pending",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    resolved_at: null,
    corrected_category: null,
    corrected_priority: null,
    agent_notes: null,
    society_name: "Sunview Heights",
    extracted_location: "Tower 4 Main Lobby",
    extracted_asset_id: "LCK-108-A"
  },
  {
    id: "TCK-9403",
    email_id: "em_849203",
    title: "Mere locker ka gate jam ho gaya hai light flashing fast",
    body: "Locker number 405 ka door thoda bent hai, jab button daba rahe hai to yellow light blinks but lock open nahi ho raha. Pls check kardo.",
    category: "locker_access",
    priority: "high",
    confidence: 0.58,
    suggested_action: "Assign maintenance crew to inspect door alignment & lock solenoid.",
    reasoning: "Hinglish description of hardware door jam and LED code signal. Confidence low due to code-mixed phrasing.",
    requires_human_review: true,
    status: "pending",
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    resolved_at: null,
    corrected_category: null,
    corrected_priority: null,
    agent_notes: null,
    society_name: "Palms Residency",
    extracted_location: "Clubhouse Annex",
    extracted_asset_id: "LCK-405-C"
  },
  {
    id: "TCK-9404",
    email_id: "em_849204",
    title: "Double charge on monthly subscription invoice #INV-882",
    body: "I noticed my bank statement shows two debits of ₹499 on July 24th for Secure Manager Premium Locker plan. Kindly process a refund for the duplicate transaction.",
    category: "billing_payment",
    priority: "medium",
    confidence: 0.98,
    suggested_action: "Verify billing ledger for duplicate charge #INV-882 and initiate payment gateway refund.",
    reasoning: "Standard billing dispute with explicit invoice ID provided.",
    requires_human_review: false,
    status: "resolved",
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    corrected_category: null,
    corrected_priority: null,
    agent_notes: "Refund processed via Razorpay reference #RF-9912.",
    society_name: "Eminent Towers",
    extracted_location: "N/A",
    extracted_asset_id: "INV-882"
  },
  {
    id: "TCK-9405",
    email_id: "em_849205",
    title: "Ownership transfer request for Flat 802 Secure Manager slot",
    body: "We sold our apartment in Royal Palms and moving out next week. New owner details attached. Please update ownership record on account.",
    category: "account_kyc",
    priority: "medium",
    confidence: 0.91,
    suggested_action: "Send KYC re-verification form to incoming resident email.",
    reasoning: "Account management request for tenancy/ownership transfer.",
    requires_human_review: false,
    status: "pending",
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 130 * 60 * 1000).toISOString(),
    resolved_at: null,
    corrected_category: null,
    corrected_priority: null,
    agent_notes: null,
    society_name: "Royal Palms",
    extracted_location: "Tower 2 - Flat 802",
    extracted_asset_id: "ACC-8812"
  },
  {
    id: "TCK-9406",
    email_id: "em_849206",
    title: "Request for additional locker installation in Tower C",
    body: "Greetings from Society RWA Committee. Our residents love the Secure Manager facility in Tower A and B. Can we schedule a site survey to install 10 additional units in Tower C?",
    category: "facility_request",
    priority: "low",
    confidence: 0.95,
    suggested_action: "Forward inquiry to Expansion & Account Manager for society site visit.",
    reasoning: "Society-level expansion inquiry from RWA committee.",
    requires_human_review: false,
    status: "pending",
    created_at: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 1140 * 60 * 1000).toISOString(),
    resolved_at: null,
    corrected_category: null,
    corrected_priority: null,
    agent_notes: null,
    society_name: "Oakridge Greens",
    extracted_location: "Tower C Ground Floor",
    extracted_asset_id: "N/A"
  }
];

const INITIAL_TELEMETRY = [
  { id: 1, ticket_id: "TCK-9401", event_type: "CLASSIFICATION_ALERT", message: "Rule Safety Net forced Urgent priority due to tamper keywords.", level: "warning", created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 2, ticket_id: "TCK-9402", event_type: "LLM_CLASSIFY_SUCCESS", message: "Gemini 2.5 classified email em_849202 as locker_access (92% confidence).", level: "info", created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
  { id: 3, ticket_id: "TCK-9403", event_type: "FLAGGED_HUMAN_REVIEW", message: "Confidence (0.58) below threshold (0.70). Sent to human queue.", level: "warning", created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
  { id: 4, ticket_id: "TCK-9404", event_type: "TICKET_RESOLVED", message: "Agent approved billing refund suggestion.", level: "success", created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
];

function ensureStoreExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const store = {
      tickets: INITIAL_SEED_TICKETS,
      telemetry: INITIAL_TELEMETRY,
      settings: {
        confidence_threshold: 0.70,
        auto_routing_enabled: true,
        keyword_safety_net: true,
        urgent_sla_minutes: 15,
        high_sla_minutes: 60,
        medium_sla_minutes: 240,
        low_sla_minutes: 1440
      }
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  }
}

export function readStore() {
  ensureStoreExists();
  try {
    const content = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading store file, resetting:', err);
    ensureStoreExists();
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  }
}

export function writeStore(data) {
  ensureStoreExists();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Database helper functions
export function getTickets(filters = {}) {
  const store = readStore();
  let result = [...store.tickets];

  if (filters.requires_human_review === 'true') {
    result = result.filter(t => t.requires_human_review);
  }

  if (filters.priority) {
    result = result.filter(t => t.priority.toLowerCase() === filters.priority.toLowerCase());
  }

  if (filters.category) {
    result = result.filter(t => t.category.toLowerCase() === filters.category.toLowerCase());
  }

  if (filters.status) {
    result = result.filter(t => t.status.toLowerCase() === filters.status.toLowerCase());
  }

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(s) ||
      t.body.toLowerCase().includes(s) ||
      t.id.toLowerCase().includes(s) ||
      t.email_id.toLowerCase().includes(s)
    );
  }

  // Sort by recency by default
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return result;
}

export function getTicketById(id) {
  const store = readStore();
  return store.tickets.find(t => t.id === id || t.email_id === id) || null;
}

export function saveTicket(ticket) {
  const store = readStore();
  const index = store.tickets.findIndex(t => t.id === ticket.id || t.email_id === ticket.email_id);
  
  if (index >= 0) {
    store.tickets[index] = { ...store.tickets[index], ...ticket };
  } else {
    store.tickets.unshift(ticket);
  }
  
  writeStore(store);
  return ticket;
}

export function updateTicketStatus(id, updates) {
  const store = readStore();
  const ticket = store.tickets.find(t => t.id === id);
  if (!ticket) return null;

  Object.assign(ticket, updates);
  if (updates.status === 'resolved' && !ticket.resolved_at) {
    ticket.resolved_at = new Date().toISOString();
  }

  writeStore(store);
  
  // Log telemetry event
  logTelemetry({
    ticket_id: id,
    event_type: updates.corrected_category ? "AGENT_RECLASSIFICATION" : "TICKET_UPDATE",
    message: updates.corrected_category
      ? `Agent reclassified ticket ${id} to category '${updates.corrected_category}' (Priority: '${updates.corrected_priority || ticket.priority}')`
      : `Ticket ${id} status updated to '${updates.status}'`,
    level: "info"
  });

  return ticket;
}

export function logTelemetry({ ticket_id, event_type, message, level = "info" }) {
  const store = readStore();
  const log = {
    id: Date.now(),
    ticket_id,
    event_type,
    message,
    level,
    created_at: new Date().toISOString()
  };
  store.telemetry.unshift(log);
  if (store.telemetry.length > 50) store.telemetry.pop();
  writeStore(store);
  return log;
}

export function getTelemetry() {
  const store = readStore();
  return store.telemetry || [];
}

export function getSettings() {
  const store = readStore();
  return store.settings;
}

export function updateSettings(newSettings) {
  const store = readStore();
  store.settings = { ...store.settings, ...newSettings };
  writeStore(store);
  logTelemetry({
    ticket_id: "SYSTEM",
    event_type: "SETTINGS_UPDATE",
    message: `System confidence threshold updated to ${(store.settings.confidence_threshold * 100).toFixed(0)}%.`,
    level: "warning"
  });
  return store.settings;
}

export function calculateSlaDeadline(priority, createdAtDate = new Date()) {
  const store = readStore();
  const settings = store.settings;
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
