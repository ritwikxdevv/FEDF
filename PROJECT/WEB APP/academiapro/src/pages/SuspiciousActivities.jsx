import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, RefreshCw, User, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../utils/api';

const VIOLATION_LABELS = {
  'tab-switch':      { label: 'Tab Switch',       color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  'focus-loss':      { label: 'Window Focus Loss', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  'fullscreen-exit': { label: 'Fullscreen Exit',   color: 'text-blue-400   bg-blue-400/10   border-blue-400/20'   },
  'copy':            { label: 'Copy Attempt',       color: 'text-red-400   bg-red-400/10    border-red-400/20'     },
  'paste':           { label: 'Paste Attempt',      color: 'text-red-400   bg-red-400/10    border-red-400/20'     },
  'right-click':     { label: 'Right-Click',        color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
};

export default function SuspiciousActivities() {
  const [violations, setViolations] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const fetchViolations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/violations');
      const list = Array.isArray(data) ? data : [];
      setViolations(list);
      setFiltered(list);
    } catch (err) {
      setError(err.message || 'Failed to load violations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchViolations(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) { setFiltered(violations); return; }
    setFiltered(
      violations.filter(
        (v) =>
          v.studentId?.name?.toLowerCase().includes(q) ||
          v.studentId?.email?.toLowerCase().includes(q) ||
          v.examId?.title?.toLowerCase().includes(q) ||
          v.violationType?.toLowerCase().includes(q)
      )
    );
  }, [search, violations]);

  // Group by student+exam to compute violation counts
  const groupCounts = {};
  violations.forEach((v) => {
    const key = `${v.studentId?._id}_${v.examId?._id}`;
    groupCounts[key] = (groupCounts[key] || 0) + 1;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-surface min-h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-up">
        <div>
          <h1 className="text-headline-md font-semibold text-on-surface">Suspicious Activities</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Monitor flagged actions detected during examinations.
            {!loading && (
              <span className="ml-2 font-medium text-on-surface">
                {violations.length} record{violations.length !== 1 ? 's' : ''} found.
              </span>
            )}
          </p>
        </div>
        <button onClick={fetchViolations} className="btn-ghost" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4 fade-in-up fade-in-up-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Search by student, exam, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full pl-10 bg-surface-container-low border-outline-variant py-2.5"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertTriangle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="fade-in-up fade-in-up-2 flex flex-col items-center justify-center py-24 px-4 border border-dashed border-outline-variant rounded-xl bg-surface-container-low">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
            <ShieldAlert size={32} className="text-green-500 opacity-80" />
          </div>
          <h3 className="text-body-base font-semibold text-on-surface mb-2">No Suspicious Activities Detected</h3>
          <p className="text-body-sm text-on-surface-variant max-w-md text-center">
            {search ? 'No results match your search.' : 'All recent examination sessions have proceeded normally.'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="fade-in-up fade-in-up-2 rounded-xl border border-outline-variant overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="text-left px-5 py-3 text-on-surface-variant font-semibold tracking-wide text-xs uppercase">Student</th>
                <th className="text-left px-5 py-3 text-on-surface-variant font-semibold tracking-wide text-xs uppercase">Exam</th>
                <th className="text-left px-5 py-3 text-on-surface-variant font-semibold tracking-wide text-xs uppercase">Violation</th>
                <th className="text-left px-5 py-3 text-on-surface-variant font-semibold tracking-wide text-xs uppercase">Total (student/exam)</th>
                <th className="text-left px-5 py-3 text-on-surface-variant font-semibold tracking-wide text-xs uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((v) => {
                const badge = VIOLATION_LABELS[v.violationType] || { label: v.violationType, color: 'text-on-surface-variant bg-surface-container border-outline-variant' };
                const key   = `${v.studentId?._id}_${v.examId?._id}`;
                const count = groupCounts[key] || 1;
                return (
                  <tr key={v._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <User size={13} />
                        </div>
                        <div>
                          <p className="font-medium text-on-surface leading-tight">{v.studentId?.name || '—'}</p>
                          <p className="text-xs text-on-surface-variant">{v.studentId?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <BookOpen size={13} />
                        <span>{v.examId?.title || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-bold text-sm ${count >= 3 ? 'text-red-400' : count === 2 ? 'text-amber-400' : 'text-on-surface-variant'}`}>
                        {count} / 3
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                        <Clock size={12} />
                        {new Date(v.createdAt || v.timestamp).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
