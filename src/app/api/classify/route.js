import { NextResponse } from 'next/server';
import { classifyEmail } from '@/lib/classifier';
import { saveTicket, calculateSlaDeadline, logTelemetry, getSettings } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, body: emailBody, email_id, society_name } = body;

    if (!title || !emailBody || !email_id) {
      return NextResponse.json(
        { error: "Missing required fields: title, body, and email_id are mandatory." },
        { status: 400 }
      );
    }

    const settings = getSettings();
    const threshold = settings.confidence_threshold || 0.70;

    // Run AI / Hybrid classification engine
    const classification = await classifyEmail({
      title,
      body: emailBody,
      email_id,
      confidenceThreshold: threshold
    });

    const createdAt = new Date().toISOString();
    const slaDeadline = calculateSlaDeadline(classification.priority, new Date());

    // Collision-safe ticket ID derived from a UUID
    const ticketId = `TCK-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;

    const newTicketRecord = {
      id: ticketId,
      email_id: classification.email_id,
      title,
      body: emailBody,
      category: classification.category,
      priority: classification.priority,
      confidence: classification.confidence,
      suggested_action: classification.suggested_action,
      reasoning: classification.reasoning,
      requires_human_review: classification.requires_human_review,
      status: "pending",
      created_at: createdAt,
      sla_deadline: slaDeadline,
      resolved_at: null,
      corrected_category: null,
      corrected_priority: null,
      agent_notes: null,
      // Accept society_name from request body; fall back to "Unknown Society"
      society_name: society_name || "Unknown Society",
      extracted_location: classification.extracted_location || "Main Locker Bank",
      extracted_asset_id: classification.extracted_asset_id || "N/A"
    };

    saveTicket(newTicketRecord);

    // Log telemetry
    logTelemetry({
      ticket_id: ticketId,
      event_type: classification.requires_human_review ? "FLAGGED_HUMAN_REVIEW" : "AUTO_ROUTED",
      message: classification.requires_human_review
        ? `Ticket ${ticketId} [${classification.category}] flagged for human review (Confidence: ${(classification.confidence * 100).toFixed(0)}%).`
        : `Ticket ${ticketId} [${classification.category}] auto-routed to ${classification.priority} queue.`,
      level: classification.category === 'security_concern' ? 'warning' : 'info'
    });

    // Return exact API contract requested in PRD Section 6
    return NextResponse.json({
      ticket_id: ticketId,
      email_id: classification.email_id,
      category: classification.category,
      priority: classification.priority,
      confidence: classification.confidence,
      suggested_action: classification.suggested_action,
      requires_human_review: classification.requires_human_review,
      reasoning: classification.reasoning,
      sla_deadline: slaDeadline
    }, { status: 201 });

  } catch (err) {
    console.error("Classification API error:", err);
    return NextResponse.json(
      { error: "Internal classification service error", details: err.message },
      { status: 500 }
    );
  }
}
