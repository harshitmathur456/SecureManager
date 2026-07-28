import { NextResponse } from 'next/server';
import { getTicketById, updateTicketStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const ticket = getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = updateTicketStatus(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
