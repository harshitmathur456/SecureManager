import { NextResponse } from 'next/server';
import { getTickets } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      requires_human_review: searchParams.get('requires_human_review'),
      priority: searchParams.get('priority'),
      category: searchParams.get('category'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    };

    const tickets = await getTickets(filters);
    return NextResponse.json(
      { tickets, count: tickets.length },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
