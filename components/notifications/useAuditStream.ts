'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';

export function useAuditStream(auditId: string, auditUrl: string, enabled: boolean) {
  const router = useRouter();
  const { addToast } = useToast();
  const closedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    closedRef.current = false;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const es = new EventSource(`/api/audits/${auditId}/stream`);

    es.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data as string) as { status: string };

      if (data.status === 'completed') {
        addToast('Audit complete! Results are ready.', 'success');

        if (document.hidden && Notification.permission === 'granted') {
          new Notification('Audit Complete', {
            body: `RGAA audit for ${auditUrl} is ready.`,
            icon: '/favicon.ico',
          });
        }

        es.close();
        closedRef.current = true;
        router.refresh();
      } else if (data.status === 'failed') {
        addToast('Audit failed. Please try again.', 'error');
        es.close();
        closedRef.current = true;
        router.refresh();
      }
    };

    es.onerror = () => {
      if (!closedRef.current) {
        es.close();
      }
    };

    return () => {
      es.close();
    };
  }, [auditId, auditUrl, enabled, router, addToast]);
}
