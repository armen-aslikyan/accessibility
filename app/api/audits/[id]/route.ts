import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { transformAuditForUI } from '@/lib/transform-audit';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: { criteria: { orderBy: { article: 'asc' } } },
  });

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  if (audit.status === 'completed' && audit.criteria.length > 0) {
    return NextResponse.json(transformAuditForUI(audit));
  }

  return NextResponse.json({ id: audit.id, url: audit.url, status: audit.status });
}
