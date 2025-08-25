import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Validate that SESSION_PASSWORD exists and meets requirements
if (!process.env.SESSION_PASSWORD) {
  throw new Error("SESSION_PASSWORD environment variable is required");
}

if (process.env.SESSION_PASSWORD.length < 32) {
  throw new Error("SESSION_PASSWORD must be at least 32 characters long");
}

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD,
  cookieName: "sessao_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict' as const,
    path: '/',
  },
};

// Type definition for your session data
export interface SessionData {
  isLoggedIn: boolean;
}

// Default session data
export const defaultSession: SessionData = {
  isLoggedIn: false,
};

// For Server Components, Server Actions, and Route Handlers
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return await getIronSession<SessionData>(cookieStore, sessionOptions);
}

// For Route Handlers - create a response and use it with the request
export async function getSessionFromRoute(request: NextRequest, response: Response): Promise<IronSession<SessionData>> {
  return await getIronSession<SessionData>(request, response, sessionOptions);
}

// Usage examples:

// Server Component (app/admin/page.tsx):
/*
import { getSession } from '@/lib/session-config';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session.isLoggedIn) {
    redirect('/login');
  }
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.username}!</p>
    </div>
  );
}
*/

// Server Action (app/actions/auth.ts):
/*
'use server';
import { getSession } from '@/lib/session-config';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const session = await getSession();
  
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  // Validate credentials here...
  if (username === 'admin' && password === 'password') {
    session.userId = "123";
    session.username = username;
    session.isLoggedIn = true;
    await session.save();
    
    redirect('/admin');
  }
  
  throw new Error('Invalid credentials');
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
*/

// Route Handler (app/api/auth/login/route.ts):
/*
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session-config';

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  
  const { username, password } = await request.json();
  
  // Validate credentials...
  if (username === 'admin' && password === 'password') {
    session.userId = "123";
    session.username = username;
    session.isLoggedIn = true;
    await session.save();
    
    return NextResponse.json({ success: true }, response);
  }
  
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
}
*/

// Alternative: Use getSession() for simpler cases (logout):
/*
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session-config';

export async function POST() {
  const session = await getSession();
  session.destroy();
  
  return NextResponse.json({ success: true });
}
*/

// Middleware for protected routes (middleware.ts):
/*
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session-config';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  
  // Check if accessing protected route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/admin/:path*']
};
*/