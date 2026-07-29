/**
 * tests/classifier.test.mjs
 *
 * Unit tests for the guardrail logic in classifier.js using Node's built-in
 * test runner (node:test). Run with:  npm test
 *
 * These tests exercise the three critical guardrails WITHOUT making any real
 * network calls — the GROQ_API_KEY env var is intentionally unset so the
 * fallback rule classifier is used throughout.
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

// Ensure no API key is present so we always use the fallback rule classifier
delete process.env.GROQ_API_KEY;

// Dynamic import after env is set
const { classifyEmail } = await import('../src/lib/classifier.js');

// ---------------------------------------------------------------------------
// Helper: run classifyEmail with a default 0.70 threshold
// ---------------------------------------------------------------------------
async function classify(title, body, threshold = 0.70) {
  return classifyEmail({ title, body, email_id: 'em_test', confidenceThreshold: threshold });
}

// ---------------------------------------------------------------------------
// Guardrail A: confidence below threshold → requires_human_review = true
// ---------------------------------------------------------------------------
describe('Guardrail A — low confidence forces human review', () => {
  test('confidence 0.50 with threshold 0.70 → requires_human_review true', async () => {
    // Use a vague query that the rule classifier returns ~0.78 confidence for,
    // then set a very high threshold to force the guardrail to trigger.
    const result = await classify('General feedback', 'Nice service overall.', 0.99);
    // The fallback returns 0.78 for feedback_other, which is < 0.99
    assert.equal(result.requires_human_review, true,
      'Low confidence relative to threshold must set requires_human_review=true');
  });

  test('confidence above threshold → requires_human_review not forced true', async () => {
    // Billing keyword — fallback returns 0.94, threshold is default 0.70
    const result = await classify('Double charge on my account', 'I was debited ₹499 twice.');
    assert.equal(result.category, 'billing_payment');
    // 0.94 >= 0.70, so guardrail must NOT force review (billing_payment doesn't auto-flag)
    assert.equal(result.requires_human_review, false,
      'High confidence billing ticket should NOT be forced into human review');
  });
});

// ---------------------------------------------------------------------------
// Guardrail B: category "security_concern" → urgent + requires_human_review
// ---------------------------------------------------------------------------
describe('Guardrail B — security_concern always urgent & human review', () => {
  test('tamper keyword forces security_concern, urgent, requires_human_review', async () => {
    const result = await classify(
      'Someone tampered with locker #204',
      'I found fresh tamper marks on the lock bezel. Please help!'
    );
    assert.equal(result.category, 'security_concern',
      'Physical security keyword must produce security_concern category');
    assert.equal(result.priority, 'urgent',
      'security_concern must always be urgent');
    assert.equal(result.requires_human_review, true,
      'security_concern must always require human review');
  });

  test('theft keyword forces security_concern regardless of confidence', async () => {
    const result = await classify(
      'Theft from locker',
      'Something was stolen from my locker compartment, I am not sure how.'
    );
    assert.equal(result.category, 'security_concern');
    assert.equal(result.priority, 'urgent');
    assert.equal(result.requires_human_review, true);
  });
});

// ---------------------------------------------------------------------------
// Guardrail C: security keyword in body forces safety net regardless of input
// ---------------------------------------------------------------------------
describe('Guardrail C — keyword safety net fires on body content', () => {
  test('security keyword buried in body text triggers safety net', async () => {
    const result = await classify(
      'Issue with my locker',
      'The door makes a strange noise and I noticed someone tried prying it open last night.'
    );
    // "prying" is in SECURITY_KEYWORDS — safety net must trigger
    assert.equal(result.category, 'security_concern',
      '"prying" in body should trigger safety net → security_concern');
    assert.equal(result.priority, 'urgent');
    assert.equal(result.requires_human_review, true);
    assert.match(result.reasoning, /Keyword Safety Net/,
      'Reasoning should mention the Keyword Safety Net trigger');
  });

  test('"unauthorized" keyword in body triggers safety net', async () => {
    const result = await classify(
      'Locker check',
      'I think there was unauthorized access to the storage area on 3rd floor.'
    );
    assert.equal(result.category, 'security_concern');
    assert.equal(result.requires_human_review, true);
  });
});

// ---------------------------------------------------------------------------
// Sanity: response always has the expected shape
// ---------------------------------------------------------------------------
describe('Response shape — all required fields present', () => {
  test('classify returns all expected fields', async () => {
    const result = await classify('Locked out', 'The keypad shows red light and wont open.');
    const required = ['email_id', 'category', 'priority', 'confidence', 'suggested_action',
      'reasoning', 'requires_human_review', 'extracted_location', 'extracted_asset_id'];
    for (const field of required) {
      assert.ok(Object.prototype.hasOwnProperty.call(result, field),
        `Result must contain field: ${field}`);
    }
    assert.equal(typeof result.confidence, 'number',
      'confidence must be a number');
    assert.ok(result.confidence >= 0 && result.confidence <= 1,
      'confidence must be between 0 and 1');
  });
});
