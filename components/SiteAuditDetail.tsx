'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import TemplateCard from './TemplateCard';
import RGAAReport from './RGAAReport';
import AccessibilityStatement from './AccessibilityStatement/AccessibilityStatement';
import type { AuditData } from '@/lib/transform-audit';

interface CriterionData {
  article: string;
  status: string;
  reasoning: string | null;
  issues: Array<{ type: string; message: string }> | null;
}

interface ViewportResultData {
  id: string;
  viewport: string;
  width: number;
  height: number;
  url: string;
  complianceRate: number | null;
  totalViolations: number | null;
  criteria: CriterionData[];
}

interface TemplateData {
  id: string;
  name: string;
  pageCount: number;
  representativeUrl: string;
  examplePaths: string[];
  complianceRate: number | null;
  viewportResults: ViewportResultData[];
}

interface LegalSummaryData {
  nonCompliantCriteria: Array<{ article: string; desc: string; level: string }>;
  totalNonCompliant: number;
  overallComplianceRate: number;
}

interface SiteAuditData {
  id: string;
  url: string;
  status: string;
  errorMessage?: string | null;
  discoveryMethod: string | null;
  totalDiscovered: number | null;
  totalTemplates: number | null;
  totalAudited: number | null;
  pagesSkipped: number | null;
  complianceRate: number | null;
  legalRiskTotal: number | null;
  legalSummary: LegalSummaryData | null;
  createdAt: string;
  completedAt: string | null;
  templates: TemplateData[];
  rgaaData?: AuditData;
}

interface PhaseEvent {
  status: string;
  phase?: string;
  errorMessage?: string | null;
  discovered?: number;
  method?: string;
  templates?: number;
  skipped?: number;
  completed?: number;
  total?: number;
  currentTemplate?: string | null;
  currentTemplateIndex?: number | null;
  totalTemplatesToAudit?: number | null;
  currentViewport?: string | null;
  viewportStep?: number | null;
  totalViewportSteps?: number | null;
  criterionCompleted?: number | null;
  criterionTotal?: number | null;
  currentCriterion?: string | null;
  viewportResultsDone?: number | null;
  criteriaRowsDone?: number | null;
}

interface Props {
  auditId: string;
  initialData: SiteAuditData;
}

const PHASE_LABEL_KEYS: Record<string, string> = {
  discovering: 'siteAudit.phases.discovering',
  clustering: 'siteAudit.phases.clustering',
  auditing: 'siteAudit.phases.auditing',
  completed: 'siteAudit.phases.completed',
  failed: 'siteAudit.phases.failed',
};

function PhaseStep({ phase, active, done, label }: { phase: string; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
          done ? 'bg-emerald-500 text-white'
          : active ? 'bg-indigo-600 text-white animate-pulse'
          : 'bg-slate-200 text-slate-400'
        }`}
      >
        {done ? '✓' : active ? '…' : '·'}
      </div>
      <span className={`text-sm ${active ? 'text-slate-900 font-semibold' : done ? 'text-slate-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}

export default function SiteAuditDetail({ auditId, initialData }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<SiteAuditData>(initialData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rgaa' | 'statement'>('dashboard');
  const [phaseEvent, setPhaseEvent] = useState<PhaseEvent | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();
  const isRunning = ['pending', 'discovering', 'clustering', 'auditing'].includes(data.status);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    const es = new EventSource(`/api/audits/${auditId}/stream`);
    eventSourceRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string) as PhaseEvent;
        setPhaseEvent(event);

        if (event.status === 'completed' || event.status === 'failed') {
          es.close();
          // Reload the page to get fresh completed data
          router.refresh();
          // Fetch updated data
          fetch(`/api/audits/${auditId}`)
            .then((r) => r.json())
            .then((d: SiteAuditData) => setData(d))
            .catch(() => {});
        }
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      es.close();
      // Fetch current status in case the stream died because it was already terminal
      fetch(`/api/audits/${auditId}`)
        .then((r) => r.json())
        .then((d: SiteAuditData) => {
          if (d.status === 'failed' || d.status === 'completed') {
            setData(d);
            router.refresh();
          }
        })
        .catch(() => {});
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [auditId, isRunning, router]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      eventSourceRef.current?.close();
      await fetch(`/api/audits/${auditId}`, { method: 'PATCH' });
      setData((d) => ({ ...d, status: 'failed' }));
      router.refresh();
    } finally {
      setCancelling(false);
    }
  };

  // ── In-progress view ──────────────────────────────────────────────────────
  if (isRunning) {
    const currentPhase = phaseEvent?.phase ?? data.status;
    const phases = ['discovering', 'clustering', 'auditing'];
    const currentIdx = phases.indexOf(currentPhase);
    const derivedTemplatesDone = Math.floor((phaseEvent?.viewportResultsDone ?? 0) / 3);
    const templatesDone =
      typeof phaseEvent?.completed === 'number' && phaseEvent.completed > 0
        ? phaseEvent.completed
        : derivedTemplatesDone;
    const templatesTotal =
      (phaseEvent?.totalTemplatesToAudit && phaseEvent.totalTemplatesToAudit > 0)
      ? phaseEvent.totalTemplatesToAudit
      : (phaseEvent?.total ?? 0);

    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-8" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('siteAudit.inProgressTitle')}</h2>
        <p className="text-slate-500 mb-8 font-mono text-sm">{data.url}</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left space-y-4">
          {phases.map((phase, idx) => (
            <PhaseStep
              key={phase}
              phase={phase}
              active={idx === currentIdx}
              done={idx < currentIdx}
              label={t(PHASE_LABEL_KEYS[phase] ?? phase)}
            />
          ))}
        </div>

        {phaseEvent && (
          <div className="mt-6 bg-indigo-50 rounded-xl border border-indigo-100 p-4 text-sm text-left space-y-1">
            {(phaseEvent.discovered ?? 0) > 0 && (
              <p className="text-indigo-700">
                <span className="font-semibold">{phaseEvent.discovered}</span>{' '}
                {t('siteAudit.pagesDiscovered')}
                {phaseEvent.method && ` ${t('siteAudit.viaMethod', { method: phaseEvent.method })}`}
              </p>
            )}
            {(phaseEvent.templates ?? 0) > 0 && (
              <p className="text-indigo-700">
                <span className="font-semibold">{phaseEvent.templates}</span>{' '}
                {t('siteAudit.uniquePagesIdentified')}
                {(phaseEvent.skipped ?? 0) > 0 &&
                  `, ${phaseEvent.skipped} ${t('siteAudit.pagesSkippedUnchanged')}`}
              </p>
            )}
            {templatesTotal > 0 && (
              <p className="text-indigo-700">
                {t('siteAudit.auditingUniquePages')}:{' '}
                <span className="font-semibold">{templatesDone}/{templatesTotal}</span>{' '}
                {t('siteAudit.done')}
              </p>
            )}
            {phaseEvent.currentTemplate && (
              <p className="text-indigo-700">
                {t('siteAudit.nowAuditing')}:{' '}
                <span className="font-semibold">{phaseEvent.currentTemplate}</span>
                {phaseEvent.currentTemplateIndex && phaseEvent.totalTemplatesToAudit
                  ? ` (${phaseEvent.currentTemplateIndex}/${phaseEvent.totalTemplatesToAudit})`
                  : ''}
                {phaseEvent.currentViewport
                  ? ` · ${t('siteAudit.viewportName', { viewport: phaseEvent.currentViewport })}`
                  : ''}
              </p>
            )}
            {(phaseEvent.criterionTotal ?? 0) > 0 && (
              <p className="text-indigo-700">
                {t('siteAudit.criterionProgress')}:{' '}
                <span className="font-semibold">
                  {phaseEvent.criterionCompleted ?? 0}/{phaseEvent.criterionTotal}
                </span>
                {phaseEvent.currentCriterion
                  ? ` · ${t('siteAudit.currentCriterion')}: ${phaseEvent.currentCriterion}`
                  : ''}
              </p>
            )}
            {(phaseEvent.totalViewportSteps ?? 0) > 0 && (
              <p className="text-indigo-700">
                {t('siteAudit.viewportSteps')}:{' '}
                <span className="font-semibold">
                  {phaseEvent.viewportStep ?? 0}/{phaseEvent.totalViewportSteps}
                </span>
              </p>
            )}
            {(phaseEvent.viewportResultsDone ?? 0) > 0 && (
              <p className="text-indigo-700">
                {t('siteAudit.dbProgress')}:{' '}
                <span className="font-semibold">{phaseEvent.viewportResultsDone}</span>{' '}
                {t('siteAudit.viewportResults')},{' '}
                <span className="font-semibold">{phaseEvent.criteriaRowsDone ?? 0}</span>{' '}
                {t('siteAudit.criterionRowsSaved')}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-8 text-sm text-slate-400 hover:text-red-500 transition disabled:opacity-50"
        >
          {cancelling ? t('siteAudit.cancelling') : t('siteAudit.cancelAudit')}
        </button>
      </div>
    );
  }

  // ── Failed view ───────────────────────────────────────────────────────────
  if (data.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-red-500 text-6xl mb-4">✗</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('siteAudit.failedTitle')}</h2>
        <p className="text-slate-500">
          {data.errorMessage?.trim() || t('siteAudit.failedDescription')}
        </p>
      </div>
    );
  }

  // ── Completed view ────────────────────────────────────────────────────────
  const skipped = data.pagesSkipped ?? 0;
  const discovered = data.totalDiscovered ?? 0;
  const templates = data.totalTemplates ?? 0;
  const audited = data.totalAudited ?? 0;
  const host = (() => {
    try {
      return new URL(data.url).hostname;
    } catch {
      return data.url;
    }
  })();
  const complianceRate = data.complianceRate ?? 0;
  const complianceStatus: 'totalement' | 'partiellement' | 'non' =
    complianceRate >= 95 ? 'totalement' : complianceRate >= 50 ? 'partiellement' : 'non';
  const nonCompliantItems = (data.legalSummary?.nonCompliantCriteria ?? [])
    .map((c) => `${c.article} - ${c.desc || ''}`);
  const statementData = {
    siteName: data.url,
    organizationName: host,
    complianceStatus,
    complianceRate,
    auditDate: new Date(data.completedAt ?? data.createdAt).toLocaleDateString('fr-FR'),
    auditorName: 'Vivatech Audit AI',
    technologies: ['HTML5', 'CSS', 'JavaScript', 'ARIA', 'RGAA 4.1', 'axe-core', 'Mistral LLM'],
    testEnvironment: ['Desktop viewport', 'Tablet viewport', 'Mobile viewport', 'Automated + AI-assisted checks'],
    nonCompliantItems,
    contactEmail: `accessibilite@${host}`,
    contactFormUrl: data.url,
  };

  return (
    <div className="space-y-6">
      {/* Intelligence summary banner */}
      <div className="bg-indigo-600 text-white rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">{t('siteAudit.pagesDiscoveredLabel')}</p>
            <p className="text-4xl font-black mt-1">{discovered}</p>
            {skipped > 0 && (
              <p className="text-indigo-300 text-xs mt-0.5">
                {skipped} {t('siteAudit.pagesSkippedUnchanged')}
              </p>
            )}
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">{t('siteAudit.uniquePagesIdentifiedLabel')}</p>
            <p className="text-4xl font-black mt-1">{templates}</p>
            <p className="text-indigo-300 text-xs mt-0.5">{audited} {t('siteAudit.audited')}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">{t('siteAudit.viewportsTested')}</p>
            <p className="text-4xl font-black mt-1">3</p>
            <p className="text-indigo-300 text-xs mt-0.5">{t('siteAudit.viewportList')}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">{t('siteAudit.overallCompliance')}</p>
            <p
              className={`text-4xl font-black mt-1 ${
                (data.complianceRate ?? 0) >= 80 ? 'text-emerald-300'
                : (data.complianceRate ?? 0) >= 50 ? 'text-orange-300'
                : 'text-red-300'
              }`}
            >
              {data.complianceRate != null ? `${data.complianceRate.toFixed(1)}%` : '—'}
            </p>
            <p className="text-indigo-300 text-xs mt-0.5">
              {t('siteAudit.discoveryVia')} {data.discoveryMethod ?? t('siteAudit.unknown')}
            </p>
          </div>
        </div>

        <p className="text-indigo-200 text-sm mt-4 border-t border-indigo-500 pt-4">
          {t('siteAudit.summaryPrefix')}{' '}
          <strong className="text-white">{discovered} {t('siteAudit.pages')}</strong>{' '}
          {t('siteAudit.summaryMiddle')}{' '}
          <strong className="text-white">{templates} {t('siteAudit.uniquePages')}</strong>{' '}
          {t('siteAudit.summarySuffix')}{' '}
          <strong className="text-white">{audited} {t('siteAudit.representatives')}</strong>{' '}
          {t('siteAudit.summaryEnd')}
        </p>
      </div>

      {/* Tab nav */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <nav className="flex">
          {(['dashboard', 'rgaa', 'statement'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold transition border-b-2 rounded-t-xl ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'dashboard'
                ? `⚙ ${t('nav.dashboard')}`
                : tab === 'rgaa'
                  ? `📋 ${t('nav.rgaa')}`
                  : `📝 ${t('nav.statement')}`}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {data.templates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500">{t('siteAudit.noTemplateData')}</p>
            </div>
          ) : (
            data.templates.map((t) => (
              <TemplateCard
                key={t.id}
                name={t.name}
                pageCount={t.pageCount}
                representativeUrl={t.representativeUrl}
                examplePaths={t.examplePaths as string[]}
                complianceRate={t.complianceRate}
                viewportResults={t.viewportResults}
              />
            ))
          )}
        </div>
      )}

      {/* RGAA tab */}
      {activeTab === 'rgaa' && data.rgaaData && (
        <RGAAReport data={data.rgaaData} />
      )}

      {activeTab === 'rgaa' && !data.rgaaData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">{t('siteAudit.legalSummaryNotAvailable')}</p>
        </div>
      )}

      {/* Declaration tab */}
      {activeTab === 'statement' && <AccessibilityStatement data={statementData} />}
    </div>
  );
}
