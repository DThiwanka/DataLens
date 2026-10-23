import {
  Table2,
  BarChart2,
  Wand2,
} from 'lucide-react';
import ColumnProfile from '../components/ColumnProfile';
import { formatNumber, formatBytes } from '../utils/formatters.js';

export default function Dashboard({
  profile,
  onNavigateToTab,
  onSelectColumnForChart,
}) {
  if (!profile) return null;

  const {
    rowCount,
    columnCount,
    missingCells,
    missingRate,
    duplicateRows,
    healthScore,
    typeDistribution,
    columnProfiles,
    metadata,
  } = profile;

  const getHealthBadge = (score) => {
    if (score >= 90) return { label: 'High quality', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 75) return { label: 'Good', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (score >= 50) return { label: 'Moderate', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Needs attention', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const healthBadge = getHealthBadge(healthScore);

  return (
    <div className="space-y-5">
      {/* Workspace Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E6EB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-[#20242C]">
              {metadata?.fileName || 'Active Dataset'}
            </h2>
            <span className="rounded border border-[#E3E6EB] bg-[#F1F3F5] px-1.5 py-0.5 text-[11px] font-mono text-[#667085]">
              {metadata?.delimiter === '\t' ? 'TSV' : 'CSV'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#667085]">
            {metadata?.fileName || 'dataset.csv'} · {metadata?.fileSize ? formatBytes(metadata.fileSize) : 'in-memory'} · {formatNumber(rowCount, 0)} rows · {columnCount} columns
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('explorer')}
            className="inline-flex h-8 items-center gap-1.5 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-3 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
          >
            <Table2 className="h-3.5 w-3.5 text-[#667085]" />
            <span>Explore data</span>
          </button>

          <button
            onClick={() => onNavigateToTab('charts')}
            className="inline-flex h-8 items-center gap-1.5 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-3 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
          >
            <BarChart2 className="h-3.5 w-3.5 text-[#667085]" />
            <span>Create chart</span>
          </button>

          {(missingCells > 0 || duplicateRows > 0) && (
            <button
              onClick={() => onNavigateToTab('cleaning')}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#B98220] px-3 text-xs font-medium text-white hover:bg-[#9D6D17] transition-colors shadow-xs"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Clean data</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Analytical Summary Bar (Replaces typical oversized cards) */}
      <div className="overflow-hidden rounded border border-[#E3E6EB] bg-[#FFFFFF]">
        <div className="grid grid-cols-2 divide-y divide-[#E3E6EB] sm:grid-cols-4 sm:divide-y-0 sm:divide-x divide-[#E3E6EB]">
          {/* Metric 1: Rows */}
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-[#89919F] block">Total records</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-semibold tracking-tight text-[#20242C] font-mono">
                {formatNumber(rowCount, 0)}
              </span>
              <span className="text-xs text-[#89919F]">rows</span>
            </div>
            <span className="text-[11px] text-[#667085] mt-0.5 block">
              In-browser active dataset
            </span>
          </div>

          {/* Metric 2: Columns */}
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-[#89919F] block">Schema breakdown</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-semibold tracking-tight text-[#20242C] font-mono">
                {columnCount}
              </span>
              <span className="text-xs text-[#89919F]">columns</span>
            </div>
            <span className="text-[11px] text-[#667085] mt-0.5 block">
              {typeDistribution.numeric} numeric · {typeDistribution.text} text {typeDistribution.date ? `· ${typeDistribution.date} date` : ''}
            </span>
          </div>

          {/* Metric 3: Data Quality & Missing */}
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-[#89919F] block">Completeness</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-semibold tracking-tight text-[#20242C] font-mono">
                {(100 - missingRate).toFixed(1)}%
              </span>
              {missingCells > 0 && (
                <span className="text-[11px] font-mono text-amber-700">
                  ({formatNumber(missingCells, 0)} empty)
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#667085] mt-0.5 block">
              {duplicateRows > 0 ? `${duplicateRows} duplicate rows` : '0 duplicates'}
            </span>
          </div>

          {/* Metric 4: Health Score */}
          <div className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#89919F]">Quality index</span>
              <span className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[10px] font-medium ${healthBadge.color}`}>
                {healthBadge.label}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight text-[#20242C] font-mono">
                {healthScore}
              </span>
              <span className="text-xs text-[#89919F]">/ 100</span>
            </div>
            <span className="text-[11px] text-[#667085] mt-0.5 block">
              Calculated from active profiles
            </span>
          </div>
        </div>
      </div>

      {/* Structured Column Schema & Quality Inspector */}
      <div className="space-y-3 pt-1">
        <div>
          <h3 className="text-sm font-semibold text-[#20242C]">Column Schema & Profiling</h3>
          <p className="text-xs text-[#89919F]">
            Inferred types, missing rates, and value distributions across {columnProfiles.length} columns.
          </p>
        </div>

        <ColumnProfile
          profiles={columnProfiles}
          onSelectColumnForChart={onSelectColumnForChart}
        />
      </div>
    </div>
  );
}
