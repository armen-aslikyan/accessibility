import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { signal } = request;

  const encoder = new TextEncoder();

  function send(controller: ReadableStreamDefaultController, data: Record<string, unknown>) {
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      // stream closed
    }
  }

  // 12 consecutive unchanged polls before declaring stale in short operations.
  // For site-mode "auditing", we do not auto-fail based on staleness because a
  // single representative can legitimately take more than a minute.
  const STALE_POLLS = 12;

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let lastStatus = '';
      let lastPhaseKey = '';
      let staleCount = 0;

      const close = () => {
        if (!closed) {
          closed = true;
          try { controller.close(); } catch { /* already closed */ }
        }
      };

      const markFailed = async () => {
        try {
          await prisma.audit.update({ where: { id }, data: { status: 'failed' } });
        } catch { /* best-effort */ }
      };

      signal.addEventListener('abort', close);

      const check = async () => {
        if (closed || signal.aborted) return;

        try {
          const audit = await prisma.audit.findUnique({
            where: { id },
            select: {
              status: true,
              mode: true,
              errorMessage: true,
              statistics: true,
              totalDiscovered: true,
              totalTemplates: true,
              totalAudited: true,
              pagesSkipped: true,
              discoveryMethod: true,
            },
          });

          if (!audit) { close(); return; }

          const terminal = audit.status === 'completed' || audit.status === 'failed';
          let viewportResultsDone = 0;
          let criteriaRowsDone = 0;
          if (audit.mode === 'site' && !terminal) {
            const [vpCount, critCount] = await Promise.all([
              prisma.viewportResult.count({ where: { auditId: id } }),
              prisma.criterionResult.count({ where: { auditId: id } }),
            ]);
            viewportResultsDone = vpCount;
            criteriaRowsDone = critCount;
          }
          const siteProgress = (audit.statistics &&
            typeof audit.statistics === 'object' &&
            'siteProgress' in audit.statistics)
            ? (audit.statistics.siteProgress as Record<string, unknown>)
            : null;
          const currentTemplate = typeof siteProgress?.currentTemplate === 'string' ? siteProgress.currentTemplate : null;
          const currentTemplateIndex = typeof siteProgress?.currentTemplateIndex === 'number' ? siteProgress.currentTemplateIndex : null;
          const totalTemplatesToAudit = typeof siteProgress?.totalTemplatesToAudit === 'number' ? siteProgress.totalTemplatesToAudit : null;
          const currentViewport = typeof siteProgress?.currentViewport === 'string' ? siteProgress.currentViewport : null;
          const viewportStep = typeof siteProgress?.viewportStep === 'number' ? siteProgress.viewportStep : null;
          const totalViewportSteps = typeof siteProgress?.totalViewportSteps === 'number' ? siteProgress.totalViewportSteps : null;
          const criterionCompleted = typeof siteProgress?.criterionCompleted === 'number' ? siteProgress.criterionCompleted : null;
          const criterionTotal = typeof siteProgress?.criterionTotal === 'number' ? siteProgress.criterionTotal : null;
          const currentCriterion = typeof siteProgress?.currentCriterion === 'string' ? siteProgress.currentCriterion : null;

          if (audit.mode === 'site') {
            const phaseKey = `${audit.status}|${audit.totalDiscovered ?? 0}|${audit.totalTemplates ?? 0}|${audit.totalAudited ?? 0}|${viewportStep ?? 0}|${criterionCompleted ?? 0}|${currentTemplate ?? ''}|${currentViewport ?? ''}|${currentCriterion ?? ''}|${viewportResultsDone}|${criteriaRowsDone}`;

            if (phaseKey !== lastPhaseKey) {
              lastPhaseKey = phaseKey;
              staleCount = 0;

              const phaseMap: Record<string, string> = {
                discovering: 'discovering',
                clustering: 'clustering',
                auditing: 'auditing',
                completed: 'completed',
                failed: 'failed',
              };

              send(controller, {
                status: audit.status,
                phase: phaseMap[audit.status] ?? audit.status,
                errorMessage: audit.errorMessage ?? null,
                discovered: audit.totalDiscovered ?? 0,
                method: audit.discoveryMethod ?? null,
                templates: audit.totalTemplates ?? 0,
                skipped: audit.pagesSkipped ?? 0,
                completed: audit.totalAudited ?? 0,
                total: audit.totalTemplates ?? 0,
                currentTemplate,
                currentTemplateIndex,
                totalTemplatesToAudit,
                currentViewport,
                viewportStep,
                totalViewportSteps,
                criterionCompleted,
                criterionTotal,
                currentCriterion,
                viewportResultsDone,
                criteriaRowsDone,
              });
            } else if (!terminal) {
              if (audit.status === 'auditing') {
                // Keep stream alive during long representative audits.
                staleCount = 0;
              } else {
                staleCount++;
                if (staleCount >= STALE_POLLS) {
                  await markFailed();
                  send(controller, { status: 'failed', phase: 'failed' });
                  close();
                  return;
                }
              }
            }
          } else {
            if (audit.status !== lastStatus) {
              lastStatus = audit.status;
              staleCount = 0;
              send(controller, { status: audit.status, errorMessage: audit.errorMessage ?? null });
            } else if (!terminal) {
              staleCount++;
              if (staleCount >= STALE_POLLS) {
                await markFailed();
                send(controller, { status: 'failed' });
                close();
                return;
              }
            }
          }

          if (terminal) { close(); return; }

          if (!signal.aborted) {
            setTimeout(check, audit.mode === 'site' ? 5000 : 10000);
          }
        } catch {
          close();
        }
      };

      await check();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
