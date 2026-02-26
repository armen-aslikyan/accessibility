import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerAudit, triggerSiteAudit } from '@/lib/audit-runner';

const VALID_VIEWPORTS = new Set(['desktop', 'tablet', 'mobile']);

export async function POST(request: NextRequest) {
  let url: string;
  let mode: string;
  let viewport: string | undefined;
  let maxDepth: number;
  let maxUrls: number;

  try {
    const body = await request.json() as {
      url?: string;
      mode?: string;
      viewport?: string;
      maxDepth?: number;
      maxUrls?: number;
    };
    url = body.url ?? '';
    mode = body.mode === 'site' ? 'site' : 'page';
    viewport = VALID_VIEWPORTS.has(body.viewport ?? '') ? body.viewport : 'desktop';
    maxDepth = typeof body.maxDepth === 'number' ? Math.min(Math.max(body.maxDepth, 1), 5) : 3;
    maxUrls = typeof body.maxUrls === 'number' ? Math.min(Math.max(body.maxUrls, 1), 500) : 200;
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
    data: {
      url,
      status: 'pending',
      mode,
      ...(mode === 'site'
        ? { maxDepth, maxUrls }
        : { viewport }),
    },
  });

  if (mode === 'site') {
    triggerSiteAudit(audit.id, url, maxDepth, maxUrls);
  } else {
    triggerAudit(audit.id, url, viewport);
  }

  return NextResponse.json({ id: audit.id }, { status: 201 });
}

export async function GET() {
  const audits = await prisma.audit.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      url: true,
      status: true,
      mode: true,
      viewport: true,
      complianceRate: true,
      totalDiscovered: true,
      totalTemplates: true,
      createdAt: true,
      completedAt: true,
    },
  });

  return NextResponse.json(audits);
}
