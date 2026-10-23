import { useState, useMemo } from 'react';
import {
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  Search,
  BarChart2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function ColumnProfile({
  profiles = [],
  onSelectColumnForChart,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedCols, setExpandedCols] = useState({});

  const toggleExpand = (colName) => {
    setExpandedCols((prev) => ({
      ...prev,
      [colName]: !prev[colName],
    }));
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesType = selectedType === 'all' || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [profiles, searchQuery, selectedType]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'numeric':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/20">
            <Hash className="h-3 w-3" />
            Numeric
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
            <Calendar className="h-3 w-3" />
            Date
          </span>
        );
      case 'boolean':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-400 border border-purple-500/20">
            <ToggleLeft className="h-3 w-3" />
            Boolean
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
            <Type className="h-3 w-3" />
            Text
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-white/8 bg-[#141820]/90 p-4 shadow-lg">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search column names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0B0E13] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {['all', 'numeric', 'text', 'date', 'boolean'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                selectedType === type
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Grid / List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredProfiles.map((p) => {
          const isExpanded = !!expandedCols[p.name];
          const hasMissing = p.emptyCount > 0;

          return (
            <div
              key={p.name}
              className="rounded-xl border border-white/8 bg-[#141820]/80 p-4 shadow-lg transition-all hover:border-white/15"
            >
              {/* Top Row: Name, Type, Completeness & Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleExpand(p.name)}
                    className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-amber-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{p.name}</span>
                      {getTypeBadge(p.type)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>
                        <strong className="text-slate-200">{formatNumber(p.uniqueCount, 0)}</strong> unique values ({p.uniquenessPercentage.toFixed(1)}%)
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-slate-200">{formatNumber(p.validCount, 0)}</strong> valid entries
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Missing percentage bar & Quick Action */}
                <div className="flex items-center gap-4">
                  <div className="w-40 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Missing:</span>
                      <span className={hasMissing ? 'font-semibold text-rose-400' : 'text-slate-400'}>
                        {p.missingPercentage.toFixed(1)}% ({p.emptyCount})
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          hasMissing ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, p.missingPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {onSelectColumnForChart && p.type === 'numeric' && (
                    <button
                      onClick={() => onSelectColumnForChart(p.name)}
                      className="hidden sm:inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20"
                      title="Plot in Chart Builder"
                    >
                      <BarChart2 className="h-3.5 w-3.5" />
                      <span>Chart</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Statistical Insights */}
              {isExpanded && (
                <div className="mt-4 border-t border-white/5 pt-4 space-y-4">
                  {/* If Numeric Column: Detailed Stats */}
                  {p.type === 'numeric' && p.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      <div className="rounded-lg bg-[#0B0E13] p-2.5 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Minimum</span>
                        <span className="text-sm font-semibold text-white">{formatNumber(p.stats.min)}</span>
                      </div>
                      <div className="rounded-lg bg-[#0B0E13] p-2.5 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Maximum</span>
                        <span className="text-sm font-semibold text-white">{formatNumber(p.stats.max)}</span>
                      </div>
                      <div className="rounded-lg bg-[#0B0E13] p-2.5 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Mean (Avg)</span>
                        <span className="text-sm font-semibold text-amber-400">{formatNumber(p.stats.mean)}</span>
                      </div>
                      <div className="rounded-lg bg-[#0B0E13] p-2.5 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Median</span>
                        <span className="text-sm font-semibold text-white">{formatNumber(p.stats.median)}</span>
                      </div>
                      <div className="rounded-lg bg-[#0B0E13] p-2.5 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Std Deviation</span>
                        <span className="text-sm font-semibold text-white">{formatNumber(p.stats.stdDev)}</span>
                      </div>
                      <div className="rounded-lg bg-[#0B0E13] p-2.5 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Zero Values</span>
                        <span className="text-sm font-semibold text-slate-300">{p.stats.zeroes}</span>
                      </div>
                    </div>
                  )}

                  {/* If Date Column: Date Span */}
                  {p.type === 'date' && p.dateStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-[#0B0E13] p-3 border border-white/5">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block">Earliest Date</span>
                        <span className="text-sm font-semibold text-emerald-400 font-mono">{p.dateStats.earliest}</span>
                      </div>
                      <div className="rounded-lg bg-[#0B0E13] p-3 border border-white/5">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block">Latest Date</span>
                        <span className="text-sm font-semibold text-emerald-400 font-mono">{p.dateStats.latest}</span>
                      </div>
                      <div className="rounded-lg bg-[#0B0E13] p-3 border border-white/5">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block">Timespan</span>
                        <span className="text-sm font-semibold text-white">{p.dateStats.spanDays} days</span>
                      </div>
                    </div>
                  )}

                  {/* Top Frequent Values (Categorical / All) */}
                  {p.topValues && p.topValues.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Most Frequent Values
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {p.topValues.map((tv, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-[#0B0E13] px-3 py-2 border border-white/5 text-xs"
                          >
                            <span className="truncate max-w-[160px] text-slate-200" title={tv.value}>
                              {tv.value || <em className="text-slate-600">(empty)</em>}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <span className="text-slate-400">{tv.count}</span>
                              <span className="text-amber-400/80">({tv.percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredProfiles.length === 0 && (
          <div className="rounded-xl border border-white/5 bg-[#141820]/50 p-8 text-center text-slate-400">
            No columns match your current search or type filter.
          </div>
        )}
      </div>
    </div>
  );
}
