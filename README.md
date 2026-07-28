# Secure Manager — Ticket Classification & Prioritisation System

An enterprise-grade, hybrid AI-powered **Ticket Classification & Prioritisation API** and dark command-center **Ops_Core Console Dashboard** built for automated triage, fail-safe routing, and human-in-the-loop review of safe deposit locker support queries.

---

## 🌟 Key Features

1. **Hybrid AI Engine (`POST /classify` & `/api/classify`)**:
   - **Keyword Safety Net Pre-Filter**: Instant regex scanner for critical security/tamper keywords (`stolen`, `chori`, `tamper`, `pry`, `unauthorized`, `locked out`, `passport inside`). Escalates priority to **URGENT** regardless of LLM confidence score.
   - **Structured Gemini LLM Classifier**: Uses `@google/genai` with strict JSON schema outputs, category taxonomy, reasoning rationale, and fallback rule engine for offline development.
   - **Human-in-the-Loop Guardrail**: Any `security_concern` query OR classification confidence `< 0.70` automatically sets `requires_human_review = true`.

2. **Ops_Core Console (4 Industrial Screens)**:
   - **Triage Queue**: High-contrast "Needs Human Review" filter, color-coded priority status ribbons, hover actions, and live telemetry log stream.
   - **Detail Analysis**: Single-ticket deep-dive featuring a circular SVG AI confidence gauge, raw email payload viewer, extracted entities matrix, and single-click reclassification feedback loop.
   - **Ops Dashboard**: High-level KPIs (AI accuracy rate %, MTTR, pending criticals), issues by housing society distribution chart, and active incident table.
   - **System Settings**: Interactive auto-routing confidence threshold slider (0.50 – 0.95) with live operational impact preview, safety net toggles, and notification matrix.

3. **Persistent Data & SLA Engine**:
   - SQLite / File-backed persistent storage of every incoming ticket, AI rationale, agent overrides, telemetry logs, and SLA deadlines.
   - Automatic `sla_deadline` computation:
     - **Urgent**: +15 minutes
     - **High**: +1 hour
     - **Medium**: +4 hours
     - **Low**: +24 hours

---

## 🏷️ Chosen Categories & Priorities Rationale

| Category | Description | Default Priority | Why This Setup Makes Sense for Locker Customers |
|---|---|---|---|
| `security_concern` | Physical tampering, unauthorized access, theft | **Urgent** | Safe deposit lockers hold valuables (jewelry, cash, documents). Physical security threats must always trigger immediate human review. |
| `locker_access` | Door jammed, passcode/OTP error, locked out | **Urgent** (if locked out) / **High** | A resident standing at a locker bank with their passport inside prior to a flight is a time-critical operational crisis. |
| `billing_payment` | Duplicate charge, refund, invoice query | **Medium** | Financial disputes need timely resolution but do not endanger physical safety or lock people out. |
| `account_kyc` | Ownership transfer, onboarding, phone update | **Medium** | Necessary administrative maintenance. |
| `facility_request` | RWA requests for new locker installation | **Low** | Commercial expansion requests sent by society admins. |
| `feedback_other` | General complaints, praise | **Low** | Informational customer feedback. |

> **Design Stance: Why Priority != Sentiment Driven**
> Physical security infrastructure cannot rely on sentiment analysis. A calmly worded email saying *"My locker door won't open and my key code is failing"* is still an **Urgent** access failure. Priority is category & situation-first.

---

## 📡 API Contract (`POST /classify`)

### Request
```json
POST /api/classify
Content-Type: application/json

{
  "email_id": "em_849202",
  "title": "Locked out! App code not generating and passport inside",
  "body": "I am at the locker right now trying to retrieve my passport for an early morning flight. The app says 'Connection Error' when generating OTP code. Please help me unlock it urgent!"
}
```

### Response (`201 Created`)
```json
{
  "ticket_id": "TCK-9402",
  "email_id": "em_849202",
  "category": "locker_access",
  "priority": "urgent",
  "confidence": 0.92,
  "suggested_action": "Trigger remote master override after verifying resident identity.",
  "requires_human_review": false,
  "reasoning": "User is physically stranded at locker with time-sensitive access failure.",
  "sla_deadline": "2026-07-29T00:58:10.123Z"
}
```

---

## 🛠️ Local Setup & Running Instructions

### Prerequisites
- Node.js 18+ installed

### Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Optional Gemini API Key** (optional, fallback rule engine runs automatically if omitted):
   ```bash
   # On Windows PowerShell
   $env:GEMINI_API_KEY="your_api_key_here"
   
   # Or create a .env.local file
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Ops_Core Console**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Test the API**:
   - Click the **"Test API Classify"** or **"Ingest Email API"** button in the top bar to send live queries to `POST /api/classify` with instant JSON response visualization and automatic queue insertion!

---

## 🔮 What We Would Improve in v2

1. **Multilingual & Hinglish Pre-Translation**:
   - Integrate a lightweight Hindi/Hinglish translation step prior to prompt classification to eliminate ambiguity in code-mixed regional queries.
2. **Automated Few-Shot Retraining Pipeline**:
   - Automatically compile agent corrections (`corrected_category`, `corrected_priority`) into few-shot prompt exemplars so the LLM self-improves with daily Ops usage.
3. **Automated Escalation Timers**:
   - Webhook timers that trigger PagerDuty alerts if an `urgent` ticket remains unassigned 5 minutes before SLA deadline breach.
