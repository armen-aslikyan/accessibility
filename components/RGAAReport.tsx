"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AuditData, CriterionData } from "@/lib/transform-audit";

const COMPLIANCE_STATUS = {
  COMPLIANT: "compliant",
  NON_COMPLIANT: "non_compliant",
  NOT_APPLICABLE: "not_applicable",
  NEEDS_REVIEW: "needs_review",
} as const;

type ComplianceStatus = (typeof COMPLIANCE_STATUS)[keyof typeof COMPLIANCE_STATUS];
type ViewportKey = "all" | "desktop" | "tablet" | "mobile";

const COLORS: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
  orange: "bg-orange-100 text-orange-800",
  slate: "bg-slate-100 text-slate-800",
};

function StatBadge({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className={`${COLORS[color]} px-4 py-2 rounded-lg flex items-center gap-2`}>
      <span>{icon}</span>
      <span className="font-bold">{value}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

function CriterionCard({ criterion }: { criterion: CriterionData & { article: string; preliminaryStatus?: string } }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [openEvidenceByOccurrence, setOpenEvidenceByOccurrence] = useState<Record<string, boolean>>({});
  const testedByLabel = (() => {
    const map: Record<string, string> = {
      axe_core: t("rgaa.testedBy.axeCore"),
      ai: t("rgaa.testedBy.ai"),
      element_detection: t("rgaa.testedBy.elementDetection"),
      multi_viewport: t("rgaa.testedBy.multiViewport"),
      desktop: t("rgaa.viewports.desktop"),
      tablet: t("rgaa.viewports.tablet"),
      mobile: t("rgaa.viewports.mobile"),
      error: t("rgaa.testedBy.error"),
    };
    return criterion.testedBy ? (map[criterion.testedBy] ?? criterion.testedBy.replace(/_/g, " ")) : null;
  })();

  const statusConfig: Record<ComplianceStatus, { labelKey: string; color: string; icon: string }> = {
    [COMPLIANCE_STATUS.COMPLIANT]: {
      labelKey: "rgaa.statusLabels.compliant",
      color: "bg-emerald-100 text-emerald-800",
      icon: "✅",
    },
    [COMPLIANCE_STATUS.NON_COMPLIANT]: {
      labelKey: "rgaa.statusLabels.nonCompliant",
      color: "bg-red-100 text-red-800",
      icon: "❌",
    },
    [COMPLIANCE_STATUS.NOT_APPLICABLE]: {
      labelKey: "rgaa.statusLabels.notApplicable",
      color: "bg-slate-100 text-slate-600",
      icon: "⊘",
    },
    [COMPLIANCE_STATUS.NEEDS_REVIEW]: {
      labelKey: "rgaa.statusLabels.needsReview",
      color: "bg-orange-100 text-orange-800",
      icon: "🔍",
    },
  };

  const statusInfo = statusConfig[criterion.status as ComplianceStatus] ?? statusConfig[COMPLIANCE_STATUS.NEEDS_REVIEW];
  const getStatusInfo = (status?: string | null) =>
    statusConfig[(status as ComplianceStatus) ?? COMPLIANCE_STATUS.NEEDS_REVIEW] ?? statusConfig[COMPLIANCE_STATUS.NEEDS_REVIEW];
  const getOccurrenceStatus = (evidence: { occurrenceAiStatus?: string | null; occurrenceStatus?: string | null }) =>
    (evidence.occurrenceAiStatus as ComplianceStatus | null) ||
    (evidence.occurrenceStatus as ComplianceStatus | null) ||
    COMPLIANCE_STATUS.NEEDS_REVIEW;

  const issuesArray = Array.isArray(criterion.issues) ? criterion.issues : [];
  const hasVisibleIssues = issuesArray.length > 0;
  const totalIssueOccurrences = issuesArray.reduce((sum, issue) => {
    const count =
      issue.totalOccurrences ??
      issue.failedOccurrences ??
      issue.needsReviewOccurrences ??
      issue.passedOccurrences ??
      issue.notApplicableOccurrences ??
      issue.evidence?.length ??
      0;
    return sum + (typeof count === "number" && Number.isFinite(count) ? count : 0);
  }, 0);

  const extractKeyAttributes = (elementHtml: string | undefined | null) => {
    const html = elementHtml ?? "";
    if (!html) return [] as { label: string; value: string }[];

    const attrs: { label: string; value: string }[] = [];
    const read = (attr: string, label: string) => {
      const match = html.match(new RegExp(`${attr}="([^"]+)"`, "i"));
      if (match && match[1]) {
        attrs.push({ label, value: match[1] });
      }
    };

    read("title", "title");
    read("alt", "alt");
    read("aria-label", "aria-label");
    read("aria-labelledby", "aria-labelledby");
    read("role", "role");
    read("href", "href");
    read("src", "src");

    return attrs;
  };

  const description = i18n.language === "en" ? criterion.descEn || criterion.desc || "" : criterion.desc || criterion.descEn || "";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 cursor-pointer hover:bg-slate-50 transition" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-indigo-600">{criterion.article}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                {statusInfo.icon} {t(statusInfo.labelKey)}
              </span>
              {criterion.level && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">{criterion.level}</span>}
              {testedByLabel && <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{testedByLabel}</span>}
              {criterion.confidence !== undefined && (
                criterion.confidence > 0 ? (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {criterion.confidence}% {t("rgaa.confidence")}
                  </span>
                ) : criterion.status === COMPLIANCE_STATUS.NEEDS_REVIEW ? (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs italic">
                    Unable to assess
                  </span>
                ) : null
              )}
              {criterion.status === COMPLIANCE_STATUS.NEEDS_REVIEW && criterion.preliminaryStatus && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    criterion.preliminaryStatus === COMPLIANCE_STATUS.COMPLIANT
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {criterion.preliminaryStatus === COMPLIANCE_STATUS.COMPLIANT ? `↑ ${t("rgaa.likelyCompliant")}` : `↓ ${t("rgaa.likelyNonCompliant")}`}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700">{description}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition" aria-label="Toggle details">
            <span className={`transform transition-transform inline-block ${expanded ? "rotate-180" : ""}`}>▼</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-200 pt-4 space-y-4 bg-slate-50">
          {criterion.reasoning && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t("rgaa.reasoning")}</h4>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="text-sm text-slate-700 break-words">{criterion.reasoning}</p>
              </div>
            </div>
          )}

          {hasVisibleIssues && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                {t("rgaa.issuesDetected")} ({totalIssueOccurrences || issuesArray.length})
              </h4>
              <div className="space-y-3">
                {issuesArray.map((issue, idx) => (
                  <div key={`${issue.ruleId ?? issue.message ?? "issue"}-${idx}`} className="bg-white p-3 rounded border border-slate-200">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {issue.ruleId && !issue.ruleId.startsWith("element-detection-") && !issue.ruleId.startsWith("ai-") && (
                        <p className="text-sm font-semibold text-slate-900">Rule: {issue.message}</p>
                      )}
                      {typeof issue.totalOccurrences === "number" || Array.isArray(issue.evidence) ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Occurrences: {issue.totalOccurrences ?? issue.evidence?.length ?? 0}
                        </span>
                      ) : null}
                      {(issue.passedOccurrences ?? 0) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Passed: {issue.passedOccurrences}</span>
                      )}
                      {(issue.failedOccurrences ?? 0) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">Failed: {issue.failedOccurrences}</span>
                      )}
                      {(issue.needsReviewOccurrences ?? 0) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">Review: {issue.needsReviewOccurrences}</span>
                      )}
                      {(issue.notApplicableOccurrences ?? 0) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">N/A: {issue.notApplicableOccurrences}</span>
                      )}
                    </div>
                    {issue.elements && issue.elements.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">{t("rgaa.affectedElements")}:</p>
                        {issue.elements.slice(0, 3).map((el, i) => (
                          <code key={i} className="block text-xs bg-slate-100 p-2 rounded mt-1 overflow-x-auto">
                            {el}
                          </code>
                        ))}
                        {issue.elements.length > 3 && <p className="text-xs text-slate-500 mt-1">+{issue.elements.length - 3} more...</p>}
                      </div>
                    )}
                    {issue.evidence && issue.evidence.length > 0 && (
                      <div className="space-y-3">
                        {issue.evidence.map((ev, evIdx) => {
                          const occurrenceKey = `${idx}-${evIdx}`;
                          const isOpen = !!openEvidenceByOccurrence[occurrenceKey];
                          const occurrenceStatus = getOccurrenceStatus(ev);
                          const occurrenceStatusInfo = getStatusInfo(occurrenceStatus);
                          return (
                            <div key={`${ev.elementHash ?? ev.screenshotUrl ?? "occ"}-${evIdx}`} className="rounded border border-slate-200 p-3 bg-slate-50">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-slate-700">Occurrence #{ev.occurrenceIndex ?? evIdx + 1}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${occurrenceStatusInfo.color}`}>{t(occurrenceStatusInfo.labelKey)}</span>
                                {ev.occurrenceAiConfidence != null && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                    {ev.occurrenceAiConfidence}% confidence
                                  </span>
                                )}
                                {ev.aiSuggestion && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">
                                    ✦ {t("rgaa.aiSuggestionLabel")}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenEvidenceByOccurrence((prev) => ({
                                      ...prev,
                                      [occurrenceKey]: !prev[occurrenceKey],
                                    }))
                                  }
                                  className="ml-auto text-xs px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                                >
                                  {isOpen ? "Hide evidence" : "Show evidence"}
                                </button>
                              </div>

                              {ev.aiSuggestion && (
                                <div className="mb-2 bg-indigo-50 px-3 py-2 rounded border border-indigo-200">
                                  <p className="text-xs font-semibold text-indigo-800 mb-0.5">{t("rgaa.aiSuggestionLabel")}</p>
                                  <p className="text-sm text-indigo-900 break-words">{ev.aiSuggestion}</p>
                                </div>
                              )}

                              {isOpen && ev.screenshotUrl && (
                                <a href={ev.screenshotUrl} target="_blank" rel="noreferrer" className="block mb-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={ev.screenshotUrl}
                                    alt={`Occurrence ${ev.occurrenceIndex ?? evIdx + 1}`}
                                    className="w-full max-h-80 object-contain rounded border border-slate-200 bg-white"
                                  />
                                </a>
                              )}

                              {isOpen && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                                  <p className="text-slate-700">
                                    <span className="font-semibold">Viewport:</span> {ev.viewport}
                                  </p>
                                  <p className="text-slate-700">
                                    <span className="font-semibold">Selector:</span> {ev.selector || "n/a"}
                                  </p>
                                  <p className="text-slate-700 md:col-span-2 break-all">
                                    <span className="font-semibold">DOM path:</span> {ev.domPath || "n/a"}
                                  </p>
                                  {ev.occurrenceAiReasoning && (
                                    <p className="text-slate-700 md:col-span-2 break-words">
                                      <span className="font-semibold">AI assessment:</span> {ev.occurrenceAiReasoning}
                                    </p>
                                  )}
                                  {ev.occurrenceReason && !ev.occurrenceAiReasoning && (
                                    <p className="text-slate-700 md:col-span-2 break-words">
                                      <span className="font-semibold">Why:</span> {ev.occurrenceReason}
                                    </p>
                                  )}
                                  {ev.screenshotPath && (
                                    <p className="text-slate-700 md:col-span-2 break-all">
                                      <span className="font-semibold">Screenshot path:</span> {ev.screenshotPath}
                                    </p>
                                  )}
                                </div>
                              )}

                              {isOpen &&
                                (() => {
                                const attrs = extractKeyAttributes(ev.elementHtml);
                                if (!attrs.length) return null;
                                return (
                                  <div className="mt-2 bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700">
                                    <p className="font-semibold mb-1">Key attributes</p>
                                    <dl className="space-y-0.5">
                                      {attrs.map((a) => (
                                        <div key={`${a.label}-${a.value}`}>
                                          <dt className="text-slate-500 mr-1">{a.label}:</dt>
                                          <dd className="font-mono break-all">{a.value}</dd>
                                        </div>
                                      ))}
                                    </dl>
                                  </div>
                                );
                              })()}

                              {(isOpen || !ev.screenshotUrl) && ev.elementHtml && (
                                <div className="mt-2">
                                  <p className="text-xs text-slate-500 mb-1">Element code</p>
                                  <code className="block text-xs bg-white p-2 rounded border border-slate-200 overflow-x-auto whitespace-pre-wrap break-all">
                                    {ev.elementHtml}
                                  </code>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {criterion.recommendations && criterion.recommendations.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t("rgaa.recommendations")}</h4>
              <ul className="list-disc list-inside space-y-1">
                {criterion.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-700">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {criterion.fix && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t("rgaa.howToFix")}</h4>
              <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                <p className="text-sm text-emerald-800">{criterion.fix}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RGAAReport({ data }: { data: AuditData }) {
  const { t } = useTranslation();
  const { criteria } = data;
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewportFilter, setViewportFilter] = useState<ViewportKey>("all");

  const criteriaArray = Object.values(criteria) as (CriterionData & { article: string; preliminaryStatus?: string })[];
  const hasViewportBreakdown = criteriaArray.some((c) => c.viewportBreakdown && Object.keys(c.viewportBreakdown).length > 0);

  const viewportAdjustedCriteria = criteriaArray.map((criterion) => {
    if (!hasViewportBreakdown || viewportFilter === "all" || !criterion.viewportBreakdown?.[viewportFilter]) {
      return criterion;
    }
    const vp = criterion.viewportBreakdown[viewportFilter];
    return {
      ...criterion,
      status: vp.status,
      reasoning: vp.reasoning,
      issues: vp.issues,
      testedBy: viewportFilter,
    };
  });

  const derivedStatistics = viewportAdjustedCriteria.reduce(
    (acc, c) => {
      acc.total += 1;
      if (c.status === COMPLIANCE_STATUS.COMPLIANT) acc.compliant += 1;
      else if (c.status === COMPLIANCE_STATUS.NON_COMPLIANT) acc.nonCompliant += 1;
      else if (c.status === COMPLIANCE_STATUS.NEEDS_REVIEW) acc.needsReview += 1;
      else acc.notApplicable += 1;
      return acc;
    },
    { total: 0, compliant: 0, nonCompliant: 0, notApplicable: 0, needsReview: 0 },
  );

  const filteredCriteria = viewportAdjustedCriteria.filter((criterion) => {
    const searchText = criterion.desc || criterion.descEn || "";
    const matchesSearch = criterion.article?.toLowerCase().includes(searchTerm.toLowerCase()) || searchText.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && criterion.status === filterStatus;
  });
  const sortedCriteria = [...filteredCriteria].sort((a, b) => a.article.localeCompare(b.article, undefined, { numeric: true, sensitivity: "base" }));

  const filters = [
    { id: "all", icon: "📋" },
    { id: "compliant", icon: "✅" },
    { id: "non_compliant", icon: "❌" },
    { id: "not_applicable", icon: "⊘" },
    { id: "needs_review", icon: "🔍" },
  ] as const;

  const filterLabel = (id: string) => {
    const map: Record<string, string> = {
      all: t("rgaa.all"),
      compliant: t("rgaa.compliant"),
      non_compliant: t("rgaa.nonCompliant"),
      not_applicable: t("rgaa.notApplicable"),
      needs_review: t("rgaa.needsReview"),
    };
    return map[id] ?? id;
  };
  const viewportLabel = (id: ViewportKey) => {
    const map: Record<ViewportKey, string> = {
      all: t("rgaa.viewports.all"),
      desktop: t("rgaa.viewports.desktop"),
      tablet: t("rgaa.viewports.tablet"),
      mobile: t("rgaa.viewports.mobile"),
    };
    return map[id];
  };
  const viewportTabs: ViewportKey[] = ["all", "desktop", "tablet", "mobile"];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t("rgaa.title")}</h2>
        <div className="flex flex-wrap gap-4">
          <StatBadge label={t("rgaa.compliant")} value={derivedStatistics.compliant || 0} color="emerald" icon="✅" />
          <StatBadge label={t("rgaa.nonCompliant")} value={derivedStatistics.nonCompliant || 0} color="red" icon="❌" />
          <StatBadge label={t("rgaa.notApplicable")} value={derivedStatistics.notApplicable || 0} color="slate" icon="⊘" />
          <StatBadge label={t("rgaa.needsReview")} value={derivedStatistics.needsReview || 0} color="orange" icon="🔍" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col gap-4">
          {hasViewportBreakdown && (
            <div className="flex gap-2 flex-wrap">
              {viewportTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewportFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition ${
                    viewportFilter === tab ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {viewportLabel(tab)}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t("rgaa.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
                    filterStatus === filter.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{filter.icon}</span>
                  {filterLabel(filter.id)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedCriteria.map((criterion) => (
          <CriterionCard key={criterion.article} criterion={criterion} />
        ))}
        {sortedCriteria.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">{t("rgaa.noResults")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
