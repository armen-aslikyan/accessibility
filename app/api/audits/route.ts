import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerAudit } from '@/lib/audit-runner';

export async function POST(request: NextRequest) {
  let url: string;

  try {
    const body = await request.json() as { url?: string };
    url = body.url ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  const audit = await prisma.audit.create({
    data: { url, status: 'pending' },
  });

  triggerAudit(audit.id, url);

  return NextResponse.json({ id: audit.id }, { status: 201 });
}

export async function GET() {
  const audits = await prisma.audit.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      url: true,
      status: true,
      complianceRate: true,
      createdAt: true,
      completedAt: true,
    },
  });

  return NextResponse.json(audits);
}
