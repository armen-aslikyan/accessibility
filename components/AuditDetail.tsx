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
  errorMessage?: string | null;
}

export default function AuditDetail({ auditId, auditUrl, status, auditData, errorMessage }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rgaa' | 'statement'>('dashboard');
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
    currentCriterion: string | null;
    phase: string | null;
    label: string | null;
  } | null>(null);
  const router = useRouter();

  const isRunning = status === 'pending' || status === 'running';

  useAuditStream(auditId, auditUrl, isRunning, (data) => {
    const raw = (data && typeof data === 'object' && 'progress' in data ? (data as any).progress : null) as
      | { completed?: unknown; total?: unknown; currentCriterion?: unknown; phase?: unknown; label?: unknown }
      | null;
    if (!raw) return;
    const completed = typeof raw.completed === 'number' ? raw.completed : null;
    const total = typeof raw.total === 'number' ? raw.total : null;
    const currentCriterion =
      typeof raw.currentCriterion === 'string' ? raw.currentCriterion : null;
    const phase = typeof raw.phase === 'string' ? raw.phase : null;
    const label = typeof raw.label === 'string' ? raw.label : null;
    if (completed !== null && total !== null && total > 0) {
      setProgress({ completed, total, currentCriterion, phase, label });
    }
  });

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
    const pct =
      progress && progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : null;

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
        {pct !== null && (
          <div className="mb-4 text-sm text-slate-600">
            <span className="font-semibold">{pct}%</span>{' '}
            {progress && (
              <span>
                ({progress.completed} / {progress.total}
                {progress.currentCriterion ? ` · RGAA ${progress.currentCriterion}` : ''})
              </span>
            )}
            {progress?.label ? <div className="mt-1 text-slate-500">{progress.label}</div> : null}
          </div>
        )}
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
        {errorMessage && (
          <pre className="mt-4 max-w-2xl text-left text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
            {errorMessage}
          </pre>
        )}
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
