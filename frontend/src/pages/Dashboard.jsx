import {
  Table2,
  BarChart2,
  Wand2,
} from 'lucide-react';
import StatCard from '../components/StatCard';
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
    totalCells,
    missingCells,
    missingRate,
    duplicateRows,
    healthScore,
    typeDistribution,
    columnProfiles,
    metadata,
  } = profile;

  const getHealthBadge = (score) => {
    if (score >= 90) return { label: 'High quality', type: 'success' };
    if (score >= 75) return { label: 'Good', type: 'info' };
    if (score >= 50) return { label: 'Moderate', type: 'warning' };
    return { label: 'Needs attention', type: 'danger' };
  };

  const healthBadge = getHealthBadge(healthScore);

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              {metadata?.fileName || 'Active Dataset'}
            </h1>
            <span className="rounded bg-gray-100 border border-gray-200 px-2 py-0.5 text-xs text-gray-600 font-mono">
              {metadata?.fileSize ? formatBytes(metadata.fileSize) : 'In-memory'}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {rowCount.toLocaleString()} rows • {columnCount} columns • {missingCells === 0 ? 'No missing cells' : `${missingCells.toLocaleString()} missing cells (${missingRate.toFixed(1)}%)`}
            {duplicateRows > 0 ? ` • ${duplicateRows} duplicate rows` : ''}
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('explorer')}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Table2 className="h-3.5 w-3.5 text-gray-500" />
            <span>Explore data</span>
          </button>

          <button
            onClick={() => onNavigateToTab('charts')}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BarChart2 className="h-3.5 w-3.5 text-gray-500" />
            <span>Create chart</span>
          </button>

          {(missingCells > 0 || duplicateRows > 0) && (
            <button
              onClick={() => onNavigateToTab('cleaning')}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#C58A16] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#B45309] transition-colors"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Clean data</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Rows"
          value={formatNumber(rowCount, 0)}
          subtitle={`${formatNumber(totalCells, 0)} total values evaluated`}
        />

        <StatCard
          title="Columns by Type"
          value={formatNumber(columnCount, 0)}
          subtitle={`${typeDistribution.numeric} numeric, ${typeDistribution.text} text, ${typeDistribution.date || 0} date`}
        />

        <StatCard
          title="Quality Score"
          value={`${healthScore}/100`}
          subtitle={`Completeness: ${(100 - missingRate).toFixed(1)}%`}
          badge={healthBadge.label}
          badgeType={healthBadge.type}
        />

        <StatCard
          title="Missing & Duplicates"
          value={`${missingRate.toFixed(1)}%`}
          subtitle={`${missingCells.toLocaleString()} empty cells • ${duplicateRows} duplicate rows`}
          badge={duplicateRows > 0 ? `${duplicateRows} duplicates` : 'No duplicates'}
          badgeType={duplicateRows > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Column Profiling Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Column Profiles & Schema</h2>
            <p className="text-xs text-gray-500">
              Inferred data types, missing rates, and distributions across all {columnProfiles.length} columns.
            </p>
          </div>
        </div>

        <ColumnProfile
          profiles={columnProfiles}
          onSelectColumnForChart={onSelectColumnForChart}
        />
      </div>
    </div>
  );
}
