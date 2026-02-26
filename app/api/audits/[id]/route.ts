import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { transformAuditForUI } from '@/lib/transform-audit';
import { transformSiteAuditForUI } from '@/lib/transform-site-audit';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({ where: { id }, select: { status: true } });
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });

  const terminal = audit.status === 'completed' || audit.status === 'failed';
  if (terminal) return NextResponse.json({ error: 'Audit already in terminal state' }, { status: 409 });

  await prisma.audit.update({ where: { id }, data: { status: 'failed' } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Prisma will handle cascading deletes if configured in schema, 
    // otherwise we might need to delete relations manually.
    // Let's check the schema first or just try the delete.
    await prisma.audit.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      criteria: { orderBy: { article: 'asc' } },
      templates: {
        include: {
          viewportResults: {
            include: { criteria: { orderBy: { article: 'asc' } } },
          },
          pages: true,
        },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  if (audit.mode === 'site') {
    const rgaaData = transformSiteAuditForUI(audit);
    return NextResponse.json({
      id: audit.id,
      url: audit.url,
      status: audit.status,
      errorMessage: audit.errorMessage,
      mode: audit.mode,
      discoveryMethod: audit.discoveryMethod,
      totalDiscovered: audit.totalDiscovered,
      totalTemplates: audit.totalTemplates,
      totalAudited: audit.totalAudited,
      pagesSkipped: audit.pagesSkipped,
      complianceRate: audit.complianceRate,
      legalRiskTotal: audit.legalRiskTotal,
      legalSummary: audit.legalSummary,
      createdAt: audit.createdAt,
      completedAt: audit.completedAt,
      templates: audit.templates,
      rgaaData,
    });
  }

  if (audit.status === 'completed' && audit.criteria.length > 0) {
    return NextResponse.json({
      ...transformAuditForUI(audit),
      mode: audit.mode,
      viewport: audit.viewport,
    });
  }

  return NextResponse.json({
    id: audit.id,
    url: audit.url,
    status: audit.status,
    errorMessage: audit.errorMessage,
    mode: audit.mode,
    viewport: audit.viewport,
  });
}
