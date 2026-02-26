'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Dashboard from './Dashboard';
import RGAAReport from './RGAAReport';
import AccessibilityStatement from './AccessibilityStatement/AccessibilityStatement';
import AuditStatusBadge from './AuditStatusBadge';
import { useAuditStream } from './notifications/useAuditStream';
import type { AuditData } from '@/lib/transform-audit';

interface Props {
  auditId: string;
  auditUrl: string;
  status: string;
  auditData: AuditData | null;
}

export default function AuditDetail({ auditId, auditUrl, status, auditData }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rgaa' | 'statement'>('dashboard');
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  const isRunning = status === 'pending' || status === 'running';

  useAuditStream(auditId, auditUrl, isRunning);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await fetch(`/api/audits/${auditId}`, { method: 'PATCH' });
      router.refresh();
    } finally {
      setCancelling(false);
    }
  };

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Audit in Progress</h2>
        <p className="text-slate-500 max-w-md mb-6">
          We are auditing{' '}
          <span className="font-mono text-indigo-600">{auditUrl}</span> for RGAA 4.1
          compliance. This can take several minutes to a few hours depending on the site.
          <br />
          <strong className="text-slate-700 mt-2 block">
            We will notify you when results are ready.
          </strong>
        </p>
        <AuditStatusBadge status={status} />
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-6 text-sm text-slate-400 hover:text-red-500 transition disabled:opacity-50"
        >
          {cancelling ? 'Cancelling…' : 'Cancel audit'}
        </button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Audit Failed</h2>
        <p className="text-slate-500">An error occurred during the audit. Please try again.</p>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-slate-500">No audit data available.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as const, label: t('nav.dashboard') },
    { id: 'rgaa' as const, label: t('nav.rgaa') },
    { id: 'statement' as const, label: t('nav.statement') },
  ];

  const host = (() => {
    try {
      return new URL(auditUrl).hostname;
    } catch {
      return auditUrl;
    }
  })();
  const complianceRate = auditData.summary.complianceRate;
  const complianceStatus: 'totalement' | 'partiellement' | 'non' =
    complianceRate >= 95 ? 'totalement' : complianceRate >= 50 ? 'partiellement' : 'non';
  const nonCompliantItems = Object.values(auditData.criteria)
    .filter((c) => c.status === 'non_compliant')
    .map((c) => `${c.article} - ${c.desc || c.descEn || ''}`);
  const statementData = {
    siteName: auditUrl,
    organizationName: host,
    complianceStatus,
    complianceRate,
    auditDate: new Date(auditData.meta.generatedAt).toLocaleDateString('fr-FR'),
    auditorName: 'Vivatech Audit AI',
    technologies: ['HTML5', 'CSS', 'JavaScript', 'ARIA', 'RGAA 4.1', 'axe-core', 'Mistral LLM'],
    testEnvironment: ['Desktop viewport', 'Automated + AI-assisted checks'],
    nonCompliantItems,
    contactEmail: `accessibilite@${host}`,
    contactFormUrl: auditUrl,
  };

  return (
    <div className="space-y-0">
      <div className="bg-white border-b border-slate-200 mb-6 rounded-xl shadow-sm">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'dashboard' && <Dashboard data={auditData} />}
      {activeTab === 'rgaa' && <RGAAReport data={auditData} />}
      {activeTab === 'statement' && <AccessibilityStatement data={statementData} />}
    </div>
  );
}
