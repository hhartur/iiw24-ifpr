import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest) {
  const cookie = req.cookies.get('auth');

  if (cookie?.value === process.env.ADMIN_KEY) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}
