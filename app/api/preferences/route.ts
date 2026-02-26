import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';

const COOKIE_NAME = 'audit_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    return NextResponse.json({ language: 'en' });
  }

  const pref = await prisma.userPreference.findUnique({ where: { sessionId } });
  return NextResponse.json({ language: pref?.language ?? 'en' });
}

export async function PUT(req: Request) {
  const { language } = (await req.json()) as { language: string };

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(COOKIE_NAME)?.value;

  const res = NextResponse.json({ ok: true });

  if (!sessionId) {
    sessionId = randomUUID();
    res.cookies.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      path: '/',
    });
  }

  await prisma.userPreference.upsert({
    where: { sessionId },
    create: { sessionId, language },
    update: { language },
  });

  return res;
}
