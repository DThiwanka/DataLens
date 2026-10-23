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
          <span className="inline-flex items-center gap-1 rounded bg-[#F1F3F5] px-1.5 py-0.5 text-[11px] font-medium text-[#20242C] border border-[#E3E6EB]">
            <Type className="h-3 w-3 text-[#667085]" />
            Text
          </span>
        );
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded border border-[#E3E6EB] bg-[#FFFFFF] p-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#89919F]" />
          <input
            type="text"
            placeholder="Filter columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] py-1 pl-8 pr-2.5 text-xs text-[#20242C] placeholder-[#89919F] focus:border-[#B98220] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 self-start sm:self-auto">
          {['all', 'numeric', 'text', 'date', 'boolean'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                selectedType === type
                  ? 'bg-[#F1F3F5] text-[#20242C] border border-[#E3E6EB] font-semibold'
                  : 'text-[#667085] hover:bg-[#F7F8FA] hover:text-[#20242C]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Schema Table */}
      <div className="overflow-hidden rounded border border-[#E3E6EB] bg-[#FFFFFF]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-[#E3E6EB] bg-[#F7F8FA] text-[#667085]">
              <tr>
                <th className="w-8 px-2 py-2 text-center border-r border-[#E3E6EB]" />
                <th className="px-3 py-2 font-medium text-[#20242C] border-r border-[#E3E6EB]">
                  Column Name
                </th>
                <th className="w-28 px-3 py-2 font-medium text-[#667085] border-r border-[#E3E6EB]">
                  Type
                </th>
                <th className="w-36 px-3 py-2 font-medium text-[#667085] border-r border-[#E3E6EB]">
                  Distinct Values
                </th>
                <th className="w-40 px-3 py-2 font-medium text-[#667085] border-r border-[#E3E6EB]">
                  Missing Rate
                </th>
                <th className="px-3 py-2 font-medium text-[#667085]">
                  Summary Statistics / Distribution
                </th>
                <th className="w-20 px-3 py-2 text-right font-medium text-[#667085]" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E3E6EB]">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#89919F]">
                    No columns match the current filter.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const isExpanded = !!expandedCols[p.name];
                  const hasMissing = p.emptyCount > 0;

                  return (
                    <tr key={p.name} className="group hover:bg-[#F7F8FA]/70 transition-colors">
                      {/* Expand Toggle */}
                      <td className="px-2 py-2 text-center border-r border-[#E3E6EB]">
                        <button
                          onClick={() => toggleExpand(p.name)}
                          className="rounded p-0.5 text-[#89919F] hover:text-[#20242C] hover:bg-[#F1F3F5]"
                          aria-label={`Toggle details for ${p.name}`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-[#20242C]" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Name */}
                      <td className="px-3 py-2 border-r border-[#E3E6EB]">
                        <span className="font-mono text-xs font-semibold text-[#20242C]">
                          {p.name}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="px-3 py-2 border-r border-[#E3E6EB]">
                        {getTypeBadge(p.type)}
                      </td>

                      {/* Distinct Values */}
                      <td className="px-3 py-2 border-r border-[#E3E6EB] text-[#667085] font-mono text-[11px]">
                        <span className="font-semibold text-[#20242C]">{formatNumber(p.uniqueCount, 0)}</span>{' '}
                        <span className="text-[#89919F]">({p.uniquenessPercentage.toFixed(0)}%)</span>
                      </td>

                      {/* Missing Rate */}
                      <td className="px-3 py-2 border-r border-[#E3E6EB]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className={hasMissing ? 'font-medium text-amber-700' : 'text-[#89919F]'}>
                              {p.missingPercentage.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-[#89919F]">
                              {formatNumber(p.emptyCount, 0)} nulls
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-[#F1F3F5]">
                            <div
                              className={`h-full rounded-full ${hasMissing ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, p.missingPercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Summary Statistics Inline */}
                      <td className="px-3 py-2 text-xs text-[#667085]">
                        {p.type === 'numeric' && p.stats && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px]">
                            <span>min: <strong className="text-[#20242C]">{formatNumber(p.stats.min)}</strong></span>
                            <span>avg: <strong className="text-[#B98220]">{formatNumber(p.stats.mean)}</strong></span>
                            <span>med: <strong className="text-[#20242C]">{formatNumber(p.stats.median)}</strong></span>
                            <span>max: <strong className="text-[#20242C]">{formatNumber(p.stats.max)}</strong></span>
                          </div>
                        )}

                        {p.type === 'date' && p.dateStats && (
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-[#20242C]">{p.dateStats.earliest}</span>
                            <span className="text-[#89919F]">→</span>
                            <span className="text-[#20242C]">{p.dateStats.latest}</span>
                            <span className="text-[#89919F]">({p.dateStats.spanDays}d span)</span>
                          </div>
                        )}

                        {p.type === 'text' && p.topValues && (
                          <div className="flex items-center gap-1.5 truncate max-w-md">
                            <span className="text-[11px] text-[#89919F]">Top:</span>
                            {p.topValues.slice(0, 2).map((tv, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded bg-[#F1F3F5] px-1.5 py-0.5 text-[10px] text-[#20242C] truncate"
                              >
                                {tv.value || <em className="text-[#89919F]">empty</em>} ({tv.count})
                              </span>
                            ))}
                          </div>
                        )}

                        {p.type === 'boolean' && (
                          <span className="text-[11px] text-[#89919F]">True / False boolean distribution</span>
                        )}

                        {/* Extended Details Drawer */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-[#E3E6EB] space-y-2">
                            {p.type === 'numeric' && p.stats && (
                              <div className="flex items-center gap-4 text-[11px] text-[#667085]">
                                <span>Std Deviation: <strong className="font-mono text-[#20242C]">{formatNumber(p.stats.stdDev)}</strong></span>
                                <span>Zero count: <strong className="font-mono text-[#20242C]">{p.stats.zeroes}</strong></span>
                              </div>
                            )}

                            {p.topValues && p.topValues.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-semibold text-[#89919F]">
                                  Frequent values:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {p.topValues.map((tv, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] font-mono text-[#20242C]"
                                    >
                                      {tv.value || '(empty)'}: {tv.count}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2 text-right">
                        {onSelectColumnForChart && p.type === 'numeric' && (
                          <button
                            onClick={() => onSelectColumnForChart(p.name)}
                            className="inline-flex h-7 items-center gap-1 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-[11px] font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
                            title={`Visualize ${p.name}`}
                          >
                            <BarChart2 className="h-3 w-3 text-[#667085]" />
                            <span>Chart</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
