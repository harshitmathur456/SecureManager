import Groq from 'groq-sdk';

// Keyword lists for fail-safe pre-filtering
const SECURITY_KEYWORDS = [
  'tamper', 'tampering', 'pry', 'prying', 'stolen', 'chori', 'chori ho gaya', 
  'thief', 'break-in', 'unauthorized', 'suspicious', 'camera', 'missing item', 
  'theft', 'stole', 'forced open'
];

const LOCKOUT_URGENT_KEYWORDS = [
  'locked out', 'flight', 'passport', 'emergency', 'medical', 'stranded', 
  'urgent', 'code not working', 'app crashes at locker', 'jammed passport'
];

const LOCKOUT_GENERAL_KEYWORDS = [
  'jammed', 'won\'t open', 'wont open', 'lock door', 'keypad', 'led flashing', 
  'red light', 'yellow light', 'code expired'
];

const BILLING_KEYWORDS = [
  'refund', 'invoice', 'charge', 'debited', 'double charge', 'payment', 
  'subscription', 'receipt', 'bank statement', 'transaction', 'rs', '₹'
];

const KYC_KEYWORDS = [
  'transfer', 'kyc', 'registration', 'tenant', 'flat owner', 'move out', 
  'new owner', 'account email', 'phone number update'
];

const FACILITY_KEYWORDS = [
  'new locker', 'rwa', 'society', 'install', 'installation', 'tower c', 
  'expansion', 'more lockers', 'site survey'
];

// Common Hindi-in-Latin-script tokens that indicate code-mixed (Hinglish) input
const HINGLISH_TOKENS = [
  'hai', 'nahi', 'kar', 'ho gaya', 'kardo', 'karo', 'pls', 'bhai',
  'yaar', 'abhi', 'band', 'khul', 'nahi ho', 'hua', 'gaya', 'wala',
  'seedha', 'jaldi', 'lagao', 'latch', 'button daba'
];

/**
 * Returns a confidence penalty [0, 0.3] proportional to the number of
 * Hinglish tokens found — the more code-mixed the text, the less certain
 * a keyword-only classifier can be.
 */
function hinglishConfidencePenalty(text) {
  const hits = HINGLISH_TOKENS.filter(token => text.includes(token)).length;
  if (hits === 0) return 0;
  // Each token lowers confidence by 0.06, capped at 0.30 reduction
  return Math.min(hits * 0.06, 0.30);
}

/**
 * Runs rule-assisted safety pre-filter
 */
function runKeywordPreFilter(title, body) {
  const text = `${title} ${body}`.toLowerCase();
  
  let securityHit = SECURITY_KEYWORDS.find(kw => text.includes(kw));
  let lockoutUrgentHit = LOCKOUT_URGENT_KEYWORDS.find(kw => text.includes(kw));

  if (securityHit) {
    return {
      safety_net_triggered: true,
      forced_category: 'security_concern',
      forced_priority: 'urgent',
      reason: `Keyword Safety Net: Detected physical security term "${securityHit}". Forced URGENT review.`
    };
  }

  if (lockoutUrgentHit) {
    return {
      safety_net_triggered: true,
      forced_category: 'locker_access',
      forced_priority: 'urgent',
      reason: `Keyword Safety Net: Detected critical lockout trigger "${lockoutUrgentHit}". Forced URGENT escalation.`
    };
  }

  return { safety_net_triggered: false };
}

/**
 * Rule-based fallback classifier when Groq API key is omitted or the API call fails
 */
function fallbackRuleClassifier(title, body, preFilter) {
  const text = `${title} ${body}`.toLowerCase();

  if (preFilter.safety_net_triggered) {
    const isSecurity = preFilter.forced_category === 'security_concern';
    return {
      category: preFilter.forced_category,
      priority: preFilter.forced_priority,
      confidence: 0.95,
      suggested_action: isSecurity
        ? "Dispatch security lead & field engineer immediately. Freeze locker access."
        : "Trigger remote master override after verifying resident identity.",
      reasoning: preFilter.reason,
      requires_human_review: isSecurity,
      extracted_location: extractLocation(text),
      extracted_asset_id: extractAssetId(text)
    };
  }

  if (BILLING_KEYWORDS.some(kw => text.includes(kw))) {
    return {
      category: 'billing_payment',
      priority: 'medium',
      confidence: 0.94,
      suggested_action: "Verify accounting ledger for transaction & initiate refund if duplicate.",
      reasoning: "Rule classifier identified payment/billing terminology.",
      requires_human_review: false,
      extracted_location: "N/A",
      extracted_asset_id: extractAssetId(text)
    };
  }

  if (KYC_KEYWORDS.some(kw => text.includes(kw))) {
    return {
      category: 'account_kyc',
      priority: 'medium',
      confidence: 0.91,
      suggested_action: "Send digital verification link to resident for account transfer.",
      reasoning: "Query pertains to account ownership, KYC, or tenancy transfer.",
      requires_human_review: false,
      extracted_location: extractLocation(text),
      extracted_asset_id: extractAssetId(text)
    };
  }

  if (FACILITY_KEYWORDS.some(kw => text.includes(kw))) {
    return {
      category: 'facility_request',
      priority: 'low',
      confidence: 0.92,
      suggested_action: "Forward proposal to Commercial Operations lead for site feasibility check.",
      reasoning: "Society-level expansion request from RWA or resident group.",
      requires_human_review: false,
      extracted_location: extractLocation(text),
      extracted_asset_id: "N/A"
    };
  }

  if (LOCKOUT_GENERAL_KEYWORDS.some(kw => text.includes(kw))) {
    const penalty = hinglishConfidencePenalty(text);
    const confidence = +(0.88 - penalty).toFixed(2);
    return {
      category: 'locker_access',
      priority: 'high',
      confidence,
      suggested_action: "Schedule maintenance technician to inspect door latch mechanism.",
      reasoning: penalty > 0
        ? `User reporting door lock obstruction. Confidence reduced by ${(penalty * 100).toFixed(0)}% due to code-mixed (Hinglish) input — rule classifier has lower certainty on mixed-language text.`
        : "User reporting door lock obstruction or mechanism issue.",
      requires_human_review: confidence < 0.70,
      extracted_location: extractLocation(text),
      extracted_asset_id: extractAssetId(text)
    };
  }

  return {
    category: 'feedback_other',
    priority: 'low',
    confidence: 0.78,
    suggested_action: "Acknowledge feedback and route to Customer Relations.",
    reasoning: "General customer query or feedback.",
    requires_human_review: false,
    extracted_location: "N/A",
    extracted_asset_id: "N/A"
  };
}

function extractLocation(text) {
  const match = text.match(/(block [a-z0-9]|tower [a-z0-9]|flat \d+|basement \d+|lobby)/i);
  return match ? match[0].toUpperCase() : "Main Society Locker Bank";
}

function extractAssetId(text) {
  const match = text.match(/(locker #?\d+|lck-\d+-\w+|inv-\d+|acc-\d+)/i);
  return match ? match[0].toUpperCase() : "LCK-GENERIC";
}

/**
 * Main classification function using Groq LLM + Pre-Filter Safety Net
 */
export async function classifyEmail({ title, body, email_id, confidenceThreshold = 0.70 }) {
  const preFilter = runKeywordPreFilter(title, body);
  const apiKey = process.env.GROQ_API_KEY;

  let classificationResult;

  if (apiKey) {
    try {
      const groq = new Groq({ apiKey });

      const prompt = `You are Secure Manager's Ops Core Automated Classifier. Secure Manager operates safe-deposit lockers inside residential societies.
Classify the following customer support email into ONE category and priority tier according to these exact guidelines:

CATEGORIES:
1. "security_concern": Tampering, unauthorized access, theft, broken locks, cameras, suspicious activity. Default Priority: urgent.
2. "locker_access": Can't open locker, app OTP failed, door jammed, forgot code. Default Priority: urgent if stranded/locked out, else high.
3. "billing_payment": Duplicate charges, refunds, subscription renewal, bank debits. Default Priority: medium.
4. "account_kyc": Ownership transfer, resident onboarding, phone update. Default Priority: medium.
5. "facility_request": Society RWA requests, adding new lockers in towers. Default Priority: low.
6. "feedback_other": General feedback, praise, suggestions. Default Priority: low.

EMAIL DETAILS:
Title: "${title}"
Body: "${body}"

Output MUST strictly be a single valid JSON object matching this schema:
{
  "category": "security_concern" | "locker_access" | "billing_payment" | "account_kyc" | "facility_request" | "feedback_other",
  "priority": "urgent" | "high" | "medium" | "low",
  "confidence": float between 0.0 and 1.0,
  "suggested_action": "Clear, single sentence actionable recommendation for Ops agent",
  "reasoning": "Brief concise sentence explaining why this classification was selected",
  "extracted_location": "Extracted location/block/flat from email or 'Main Locker Bank'",
  "extracted_asset_id": "Extracted Locker ID, Invoice ID, or 'N/A'"
}`;

      const chatCompletion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON-only classification engine. You must respond with only a single valid JSON object and no other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 512
      });

      const jsonText = chatCompletion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(jsonText);

      classificationResult = {
        category: parsed.category || 'feedback_other',
        priority: parsed.priority || 'low',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
        suggested_action: parsed.suggested_action || 'Review and triage ticket.',
        reasoning: parsed.reasoning || 'Groq LLM classification completed.',
        requires_human_review: false,
        extracted_location: parsed.extracted_location || 'Main Society Locker Bank',
        extracted_asset_id: parsed.extracted_asset_id || 'N/A'
      };
    } catch (err) {
      console.warn("Groq LLM call failed or key invalid, using fallback classifier:", err.message);
      classificationResult = fallbackRuleClassifier(title, body, preFilter);
    }
  } else {
    classificationResult = fallbackRuleClassifier(title, body, preFilter);
  }

  // APPLY CRITICAL SYSTEM GUARDRAILS (PRD Section 6 & 9b):
  
  // Guardrail 1: Keyword safety net escalates PRIORITY (and category for security keywords)
  if (preFilter.safety_net_triggered) {
    if (preFilter.forced_category === 'security_concern') {
      classificationResult.category = 'security_concern';
      classificationResult.priority = 'urgent';
    } else if (preFilter.forced_priority === 'urgent') {
      classificationResult.priority = 'urgent';
    }
    classificationResult.reasoning = `${preFilter.reason} | LLM Note: ${classificationResult.reasoning}`;
  }

  // Guardrail 2: Security concern ALWAYS requires human review and urgent priority
  if (classificationResult.category === 'security_concern') {
    classificationResult.requires_human_review = true;
    classificationResult.priority = 'urgent';
  }

  // Guardrail 3: Low confidence below system threshold ALWAYS requires human review
  if (classificationResult.confidence < confidenceThreshold) {
    classificationResult.requires_human_review = true;
  }

  return {
    email_id,
    ...classificationResult
  };
}
