import {
  Table2,
  Columns,
  Hash,
  AlertTriangle,
  HeartPulse,
  Sparkles,
  ArrowRight,
  BarChart2,
  Wand2,
  Calendar,
  Layers,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ColumnProfile from '../components/ColumnProfile';
import { formatNumber, formatBytes } from '../utils/formatters';

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
    _duplicateRate,
    healthScore,
    typeDistribution,
    columnProfiles,
    metadata,
  } = profile;

  const getHealthBadge = (score) => {
    if (score >= 90) return { label: 'Excellent', type: 'success' };
    if (score >= 75) return { label: 'Good', type: 'info' };
    if (score >= 50) return { label: 'Moderate', type: 'warning' };
    return { label: 'Attention Needed', type: 'danger' };
  };

  const healthBadge = getHealthBadge(healthScore);

  return (
    <div className="space-y-6">
      {/* Top Banner / Dataset Overview */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-r from-[#141820] via-[#161c28] to-[#141820] p-6 shadow-xl">
        {/* Amber glow accent */}
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-400">
                Active Dataset Profile
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {metadata?.fileName || 'dataset.csv'} • {metadata?.fileSize ? formatBytes(metadata.fileSize) : 'In-Memory'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dataset Health & Column Breakdown
            </h1>

            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Analyzed {rowCount.toLocaleString()} rows across {columnCount} columns. 
              {missingCells === 0
                ? ' Complete data without any missing cells detected.'
                : ` Found ${missingCells.toLocaleString()} missing cells (${missingRate.toFixed(1)}%).`}
              {duplicateRows > 0 && ` Identified ${duplicateRows.toLocaleString()} duplicate rows.`}
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('explorer')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 hover:border-amber-500/30"
            >
              <Table2 className="h-4 w-4 text-amber-400" />
              <span>Explore Rows</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateToTab('charts')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-500/20"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Build Charts</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {(missingCells > 0 || duplicateRows > 0) && (
              <button
                onClick={() => onNavigateToTab('cleaning')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
              >
                <Wand2 className="h-4 w-4" />
                <span>Clean Dataset</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* High-Level Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rows */}
        <StatCard
          title="Total Rows"
          value={formatNumber(rowCount, 0)}
          subtitle={`${formatNumber(totalCells, 0)} total cells evaluated`}
          icon={Table2}
          badge="100% In-Memory"
          badgeType="default"
        />

        {/* Total Columns */}
        <StatCard
          title="Total Columns"
          value={formatNumber(columnCount, 0)}
          subtitle={`${typeDistribution.numeric} numeric • ${typeDistribution.text} text`}
          icon={Columns}
          badge={`${typeDistribution.date || 0} dates`}
          badgeType="info"
        />

        {/* Data Quality / Health Score */}
        <StatCard
          title="Quality Score"
          value={`${healthScore}/100`}
          subtitle={`Completeness: ${(100 - missingRate).toFixed(1)}%`}
          icon={HeartPulse}
          badge={healthBadge.label}
          badgeType={healthBadge.type}
        />

        {/* Missing & Duplicates */}
        <StatCard
          title="Missing & Duplicates"
          value={`${missingRate.toFixed(1)}%`}
          subtitle={`${missingCells.toLocaleString()} empty • ${duplicateRows} duplicates`}
          icon={AlertTriangle}
          badge={duplicateRows > 0 ? `${duplicateRows} dupes` : 'No dupes'}
          badgeType={duplicateRows > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Column Type Distribution Pill Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-[#141820]/80 p-4 text-xs">
        <span className="font-semibold uppercase tracking-wider text-slate-300">
          Inferred Schema Types
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-medium text-blue-400">
            <Hash className="h-3.5 w-3.5" />
            Numeric Columns: {typeDistribution.numeric || 0}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-medium text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Text / Categorical: {typeDistribution.text || 0}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-400">
            <Calendar className="h-3.5 w-3.5" />
            Date Columns: {typeDistribution.date || 0}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1 font-medium text-purple-400">
            <Layers className="h-3.5 w-3.5" />
            Boolean: {typeDistribution.boolean || 0}
          </span>
        </div>
      </div>

      {/* Detailed Column Profiles Component */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Column Profiles & Statistics</h2>
            <p className="text-xs text-slate-400">
              Deep dive into every column: data types, unique distributions, missing rates, and numeric ranges.
            </p>
          </div>
          <span className="text-xs text-slate-500">{columnProfiles.length} total columns</span>
        </div>

        <ColumnProfile
          profiles={columnProfiles}
          onSelectColumnForChart={onSelectColumnForChart}
        />
      </div>
    </div>
  );
}
