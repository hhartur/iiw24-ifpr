// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username === process.env.username && password === process.env.password) {
    const response = NextResponse.json({ message: 'Login OK' });
    response.cookies.set('auth', process.env.ADMIN_KEY || 'admin', {
      httpOnly: true,
      path: '/', // garantir que o cookie seja acessível em toda a aplicação
      secure: process.env.NODE_ENV === 'production', // só segura em prod
      maxAge: 60 * 60 * 24 * 7, // expira em 7 dias
    });
    return response;
  }

  return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
}