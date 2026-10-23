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
import { formatNumber } from '../utils/formatters.js';

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
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200">
            <Hash className="h-3 w-3" />
            Numeric
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
            <Calendar className="h-3 w-3" />
            Date
          </span>
        );
      case 'boolean':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-200">
            <ToggleLeft className="h-3 w-3" />
            Boolean
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200">
            <Type className="h-3 w-3" />
            Text
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-md border border-gray-200 bg-white p-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search column names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white py-1.5 pl-8 pr-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 self-start sm:self-auto">
          {['all', 'numeric', 'text', 'date', 'boolean'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                selectedType === type
                  ? 'bg-gray-100 text-gray-900 border border-gray-300 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Column List */}
      <div className="space-y-2">
        {filteredProfiles.map((p) => {
          const isExpanded = !!expandedCols[p.name];
          const hasMissing = p.emptyCount > 0;

          return (
            <div
              key={p.name}
              className="rounded-md border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300"
            >
              {/* Row: Name, Type, Completeness & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleExpand(p.name)}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-700" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-xs sm:text-sm font-mono">{p.name}</span>
                    {getTypeBadge(p.type)}
                  </div>
                </div>

                {/* Right: Unique stats, Missing Bar & Action */}
                <div className="flex items-center gap-4 self-end sm:self-auto text-xs">
                  <div className="text-gray-500 text-[11px]">
                    <span className="font-medium text-gray-700">{formatNumber(p.uniqueCount, 0)}</span> unique ({p.uniquenessPercentage.toFixed(0)}%)
                  </div>

                  <div className="w-28 space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Missing:</span>
                      <span className={hasMissing ? 'font-medium text-red-600' : 'text-gray-500'}>
                        {p.missingPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${hasMissing ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, p.missingPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {onSelectColumnForChart && p.type === 'numeric' && (
                    <button
                      onClick={() => onSelectColumnForChart(p.name)}
                      className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                      title="Plot in Chart Builder"
                    >
                      <BarChart2 className="h-3 w-3 text-gray-500" />
                      <span>Chart</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Statistical Insights */}
              {isExpanded && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
                  {/* If Numeric Column: Detailed Stats */}
                  {p.type === 'numeric' && p.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                      <div className="rounded bg-gray-50 p-2 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Min</span>
                        <span className="font-semibold text-gray-900">{formatNumber(p.stats.min)}</span>
                      </div>
                      <div className="rounded bg-gray-50 p-2 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Max</span>
                        <span className="font-semibold text-gray-900">{formatNumber(p.stats.max)}</span>
                      </div>
                      <div className="rounded bg-gray-50 p-2 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Mean (Avg)</span>
                        <span className="font-semibold text-[#C58A16]">{formatNumber(p.stats.mean)}</span>
                      </div>
                      <div className="rounded bg-gray-50 p-2 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Median</span>
                        <span className="font-semibold text-gray-900">{formatNumber(p.stats.median)}</span>
                      </div>
                      <div className="rounded bg-gray-50 p-2 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Std Dev</span>
                        <span className="font-semibold text-gray-900">{formatNumber(p.stats.stdDev)}</span>
                      </div>
                      <div className="rounded bg-gray-50 p-2 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Zeroes</span>
                        <span className="font-semibold text-gray-700">{p.stats.zeroes}</span>
                      </div>
                    </div>
                  )}

                  {/* If Date Column: Date Span */}
                  {p.type === 'date' && p.dateStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="rounded bg-gray-50 p-2.5 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Earliest</span>
                        <span className="font-medium text-emerald-700 font-mono">{p.dateStats.earliest}</span>
                      </div>
                      <div className="rounded bg-gray-50 p-2.5 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Latest</span>
                        <span className="font-medium text-emerald-700 font-mono">{p.dateStats.latest}</span>
                      </div>
                      <div className="rounded bg-gray-50 p-2.5 border border-gray-200">
                        <span className="text-[10px] text-gray-500 block">Span</span>
                        <span className="font-medium text-gray-900">{p.dateStats.spanDays} days</span>
                      </div>
                    </div>
                  )}

                  {/* Top Frequent Values */}
                  {p.topValues && p.topValues.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-gray-500">
                        Top values:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.topValues.map((tv, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                          >
                            <span className="truncate max-w-[140px] font-mono text-[11px]" title={tv.value}>
                              {tv.value || <em className="text-gray-400">empty</em>}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              ({tv.count})
                            </span>
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
          <div className="rounded-md border border-gray-200 bg-white p-6 text-center text-xs text-gray-500">
            No columns match your current search or type filter.
          </div>
        )}
      </div>
    </div>
  );
}
