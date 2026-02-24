'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewAuditPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
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
          <h1 className="text-xl font-bold text-slate-900">New Audit</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Audit a Website</h2>
          <p className="text-sm text-slate-500 mb-6">
            Enter the URL of the website you want to audit for RGAA 4.1 compliance. The audit
            checks all 106 criteria using axe-core and AI analysis via Ollama.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Website URL
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

            <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-700">Before starting:</p>
              <p>• Make sure Ollama is running locally (<code>ollama serve</code>)</p>
              <p>• Pull the model first (<code>ollama pull mistral</code>)</p>
              <p>• Audits can take 30 minutes to a few hours depending on the site</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Starting audit...' : 'Start Audit'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
