import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'lockbox_store.json');
const STORE_TMP_PATH = STORE_PATH + '.tmp';

// ---------------------------------------------------------------------------
// In-process async mutex via promise chaining.
//
// Every mutating function (saveTicket, updateTicketStatus, logTelemetry,
// updateSettings) wraps its full read-modify-write cycle inside withLock().
// This guarantees that even though Node.js is single-threaded, interleaved
// async operations (e.g. two concurrent API requests hitting PATCH and POST
// at the same time) cannot read stale data from the JSON file and silently
// overwrite each other's changes.
//
// NOTE: This is a lightweight fix appropriate for a single-process local demo.
// A production system would use a real database (Postgres, Supabase, or SQLite
// with WAL mode) with proper transactional guarantees instead of a locked JSON
// file.  See README.md § "What We Would Improve" for details.
// ---------------------------------------------------------------------------
let _lockChain = Promise.resolve();

/**
 * Serialize access to the JSON store file.
 * `fn` receives no arguments and should perform the entire read-modify-write
 * cycle.  Its return value is forwarded to the caller.
 */
function withLock(fn) {
  const next = _lockChain.then(fn, fn);   // run fn after previous settles
  // Swallow rejections on the chain itself so one failure doesn't block
  // all subsequent operations — the caller still gets the rejection.
  _lockChain = next.catch(() => {});
  return next;
}

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
    requires_human_review: false,
    status: "resolved",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 0 * 60 * 1000).toISOString(),
    resolved_at: new Date().toISOString(),
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
    status: "resolved",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    resolved_at: new Date().toISOString(),
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
    requires_human_review: false,
    status: "resolved",
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    resolved_at: new Date().toISOString(),
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
    status: "resolved",
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 130 * 60 * 1000).toISOString(),
    resolved_at: new Date().toISOString(),
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
    status: "resolved",
    created_at: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    sla_deadline: new Date(Date.now() + 1140 * 60 * 1000).toISOString(),
    resolved_at: new Date().toISOString(),
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

// ---------------------------------------------------------------------------
// File I/O helpers
// ---------------------------------------------------------------------------

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
    writeStoreAtomic(store);
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

/**
 * Atomic file write: serialize JSON to a temporary file, then rename it over
 * the real store file.  fs.renameSync is atomic on the same filesystem on both
 * POSIX and NTFS, so a crash mid-write can never leave a half-written JSON
 * file on disk.
 */
function writeStoreAtomic(data) {
  ensureStoreExists();
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(STORE_TMP_PATH, json, 'utf-8');
  fs.renameSync(STORE_TMP_PATH, STORE_PATH);
}

/** @deprecated Use writeStoreAtomic inside withLock() instead. Kept for any
 *  external callers that import writeStore directly. */
export function writeStore(data) {
  writeStoreAtomic(data);
}

// ---------------------------------------------------------------------------
// Read-only helpers (no lock needed — reads are idempotent)
// ---------------------------------------------------------------------------

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

export function getTelemetry() {
  const store = readStore();
  return store.telemetry || [];
}

export function getSettings() {
  const store = readStore();
  return store.settings;
}

// ---------------------------------------------------------------------------
// Mutating helpers — every read-modify-write cycle runs inside withLock()
// so concurrent API requests can never interleave and silently overwrite
// each other's changes.
// ---------------------------------------------------------------------------

export function saveTicket(ticket) {
  return withLock(() => {
    const store = readStore();
    const index = store.tickets.findIndex(t => t.id === ticket.id || t.email_id === ticket.email_id);

    if (index >= 0) {
      store.tickets[index] = { ...store.tickets[index], ...ticket };
    } else {
      store.tickets.unshift(ticket);
    }

    writeStoreAtomic(store);
    return ticket;
  });
}

export function updateTicketStatus(id, updates) {
  return withLock(() => {
    const store = readStore();
    const ticket = store.tickets.find(t => t.id === id);
    if (!ticket) return null;

    Object.assign(ticket, updates);
    if (updates.status === 'resolved' && !ticket.resolved_at) {
      ticket.resolved_at = new Date().toISOString();
    }

    // Inline telemetry log inside the same atomic write so we don't need a
    // second read-modify-write cycle (which would deadlock the mutex).
    const telemetryLog = {
      id: Date.now(),
      ticket_id: id,
      event_type: updates.corrected_category ? "AGENT_RECLASSIFICATION" : "TICKET_UPDATE",
      message: updates.corrected_category
        ? `Agent reclassified ticket ${id} to category '${updates.corrected_category}' (Priority: '${updates.corrected_priority || ticket.priority}')`
        : `Ticket ${id} status updated to '${updates.status}'`,
      level: "info",
      created_at: new Date().toISOString()
    };
    store.telemetry.unshift(telemetryLog);
    if (store.telemetry.length > 50) store.telemetry.pop();

    writeStoreAtomic(store);
    return ticket;
  });
}

export function logTelemetry({ ticket_id, event_type, message, level = "info" }) {
  return withLock(() => {
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
    writeStoreAtomic(store);
    return log;
  });
}

export function updateSettings(newSettings) {
  return withLock(() => {
    const store = readStore();
    store.settings = { ...store.settings, ...newSettings };

    // Inline telemetry log in the same atomic write (avoids re-entrant lock).
    const telemetryLog = {
      id: Date.now(),
      ticket_id: "SYSTEM",
      event_type: "SETTINGS_UPDATE",
      message: `System confidence threshold updated to ${(store.settings.confidence_threshold * 100).toFixed(0)}%.`,
      level: "warning",
      created_at: new Date().toISOString()
    };
    store.telemetry.unshift(telemetryLog);
    if (store.telemetry.length > 50) store.telemetry.pop();

    writeStoreAtomic(store);
    return store.settings;
  });
}

// ---------------------------------------------------------------------------
// SLA helper (read-only, no lock needed)
// ---------------------------------------------------------------------------

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
