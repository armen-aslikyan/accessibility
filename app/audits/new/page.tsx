'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type Mode = 'site' | 'page';
type Viewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_OPTIONS: { value: Viewport; label: string; size: string }[] = [
  { value: 'desktop', label: 'Desktop', size: '1920×1080' },
  { value: 'tablet',  label: 'Tablet',  size: '768×1024'  },
  { value: 'mobile',  label: 'Mobile',  size: '375×812'   },
];

export default function NewAuditPage() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<Mode>('site');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [maxDepth, setMaxDepth] = useState(3);
  const [maxUrls, setMaxUrls] = useState(200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body = mode === 'site'
        ? { url, mode, maxDepth, maxUrls }
        : { url, mode, viewport };

      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Failed to start audit');
      }

      const { id } = await res.json() as { id: string };
      router.push(`/audits/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
          <Link href="/audits" className="text-slate-400 hover:text-slate-600 transition text-sm">
            ← Back to audits
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex-1">New Audit</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto">

          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMode('site')}
              className={`rounded-xl border-2 p-4 text-left transition ${
                mode === 'site'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className={`font-bold text-sm ${mode === 'site' ? 'text-indigo-700' : 'text-slate-700'}`}>
                Full Site Audit
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Discover, cluster &amp; audit all pages at 3 viewports
              </p>
              {mode === 'site' && (
                <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode('page')}
              className={`rounded-xl border-2 p-4 text-left transition ${
                mode === 'page'
                  ? 'border-slate-700 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className={`font-bold text-sm ${mode === 'page' ? 'text-slate-900' : 'text-slate-700'}`}>
                Quick Check
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Single page, one viewport, no legal weight
              </p>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {mode === 'site' ? 'Audit a Website' : 'Quick Page Check'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {mode === 'site'
                ? 'Enter the base URL. We will discover all pages via sitemap or crawl, cluster them by structure, and audit representatives at desktop, tablet and mobile.'
                : 'Enter a single page URL for a fast RGAA check at your chosen viewport. This is not a full compliance audit.'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {mode === 'site' ? 'Website URL' : 'Page URL'}
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Site-mode options */}
              {mode === 'site' && (
                <div className="space-y-4 bg-slate-50 rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Crawl depth
                      <span className="ml-2 font-normal text-slate-400">(max {maxDepth})</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                      <span>1</span><span>5</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="maxUrls" className="block text-sm font-medium text-slate-700 mb-1">
                      Max pages to discover
                    </label>
                    <input
                      id="maxUrls"
                      type="number"
                      min={10}
                      max={500}
                      step={10}
                      value={maxUrls}
                      onChange={(e) => setMaxUrls(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Page-mode viewport picker */}
              {mode === 'page' && (
                <div>
                  <p className="block text-sm font-medium text-slate-700 mb-2">Viewport</p>
                  <div className="grid grid-cols-3 gap-2">
                    {VIEWPORT_OPTIONS.map((vp) => (
                      <button
                        key={vp.value}
                        type="button"
                        onClick={() => setViewport(vp.value)}
                        className={`border rounded-lg py-2.5 px-3 text-center transition ${
                          viewport === vp.value
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <p className="text-sm font-medium">{vp.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{vp.size}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-500 space-y-1">
                <p className="font-medium text-slate-700">Before starting:</p>
                <p>• Make sure Ollama is running locally (<code>ollama serve</code>)</p>
                <p>• Pull the model first (<code>ollama pull mistral</code>)</p>
                {mode === 'site' && (
                  <p>• Full site audits take significantly longer than single-page checks</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading
                  ? 'Starting audit...'
                  : mode === 'site'
                  ? 'Start Full Site Audit'
                  : `Start Quick Check (${viewport})`}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
