import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/components/I18nProvider';
import { ToastProvider } from '@/components/notifications/ToastProvider';

export const metadata: Metadata = {
  title: 'RGAA Accessibility Audit',
  description: 'Automated RGAA 4.1 accessibility auditing tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
