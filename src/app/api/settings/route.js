import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const updated = updateSettings(body);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
