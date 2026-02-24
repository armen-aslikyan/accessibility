import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { signal } = request;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let lastStatus = '';

      const close = () => {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      };

      signal.addEventListener('abort', close);

      const check = async () => {
        if (closed || signal.aborted) return;

        try {
          const audit = await prisma.audit.findUnique({
            where: { id },
            select: { status: true },
          });

          if (!audit) {
            close();
            return;
          }

          if (audit.status !== lastStatus) {
            lastStatus = audit.status;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ status: audit.status })}

`)
            );
          }

          if (audit.status === 'completed' || audit.status === 'failed') {
            close();
            return;
          }

          if (!signal.aborted) {
            setTimeout(check, 10_000);
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
