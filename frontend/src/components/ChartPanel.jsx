import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  AreaChart as AreaIcon,
  Download,
} from 'lucide-react';
import { exportToCsv } from '../services/csvExporter';
import { isNullOrEmpty, isNumeric } from '../utils/dataTypes';
import { formatNumber, formatCompactNumber } from '../utils/formatters';

const PALETTES = {
  amber: ['#F59E0B', '#FBBF24', '#D97706', '#B45309', '#FCD34D', '#78350F'],
  cyan: ['#06B6D4', '#22D3EE', '#0891B2', '#0E7490', '#67E8F9', '#155E75'],
  emerald: ['#10B981', '#34D399', '#059669', '#047857', '#6EE7B7', '#064E3B'],
  sunset: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6', '#10B981'],
};

// Custom Dark Tooltip defined outside render
function ChartTooltip({ active, payload, label, currentColors, aggregation, yAxisCol, xAxisCol }) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    return (
      <div className="rounded-xl border border-white/10 bg-[#0B0E13]/95 p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-200">{label || dataPoint.payload?.category}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: dataPoint.color || currentColors[0] }}
          />
          <span className="text-xs text-slate-400 capitalize">
            {aggregation} of {yAxisCol || xAxisCol}:
          </span>
          <span className="text-xs font-bold font-mono text-amber-400">
            {formatNumber(dataPoint.value)}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500">
          Records in group: {dataPoint.payload?.count}
        </p>
      </div>
    );
  }
  return null;
}

export default function ChartPanel({
  data = [],
  columns = [],
  columnProfiles = [],
  initialCategoryCol = null,
  initialMeasureCol = null,
}) {
  // Extract numeric and categorical column lists
  const numericColumns = useMemo(() => {
    return columnProfiles.filter((p) => p.type === 'numeric').map((p) => p.name);
  }, [columnProfiles]);

  const categoricalColumns = useMemo(() => {
    return columnProfiles.filter((p) => p.type !== 'numeric').map((p) => p.name);
  }, [columnProfiles]);

  // Chart Configuration State
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line' | 'area' | 'pie'
  const [xAxisCol, setXAxisCol] = useState(() => {
    if (initialCategoryCol && columns.includes(initialCategoryCol)) return initialCategoryCol;
    return categoricalColumns[0] || columns[0] || '';
  });
  const [yAxisCol, setYAxisCol] = useState(() => {
    if (initialMeasureCol && columns.includes(initialMeasureCol)) return initialMeasureCol;
    return numericColumns[0] || columns[1] || '';
  });
  const [aggregation, setAggregation] = useState('sum'); // 'sum' | 'avg' | 'count' | 'min' | 'max'
  const [topLimit, setTopLimit] = useState(15);
  const [colorTheme, setColorTheme] = useState('amber');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // Compute aggregated chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !xAxisCol) return [];

    const groupMap = new Map();

    data.forEach((row) => {
      const rawX = row[xAxisCol];
      const categoryKey = isNullOrEmpty(rawX) ? '(empty)' : String(rawX).trim();

      let measureVal = 0;
      if (aggregation !== 'count') {
        const rawY = row[yAxisCol];
        if (!isNullOrEmpty(rawY)) {
          const cleanY = String(rawY).replace(/[$,\s%]/g, '');
          if (isNumeric(cleanY)) {
            measureVal = Number(cleanY);
          }
        }
      }

      if (!groupMap.has(categoryKey)) {
        groupMap.set(categoryKey, {
          category: categoryKey,
          count: 1,
          sum: measureVal,
          min: measureVal,
          max: measureVal,
          values: [measureVal],
        });
      } else {
        const entry = groupMap.get(categoryKey);
        entry.count += 1;
        entry.sum += measureVal;
        entry.min = Math.min(entry.min, measureVal);
        entry.max = Math.max(entry.max, measureVal);
        entry.values.push(measureVal);
      }
    });

    // Form final records with computed aggregation
    const results = Array.from(groupMap.values()).map((item) => {
      let finalVal;
      switch (aggregation) {
        case 'count':
          finalVal = item.count;
          break;
        case 'avg':
          finalVal = item.count > 0 ? item.sum / item.count : 0;
          break;
        case 'min':
          finalVal = item.min;
          break;
        case 'max':
          finalVal = item.max;
          break;
        case 'sum':
        default:
          finalVal = item.sum;
          break;
      }

      return {
        category: item.category,
        value: Number(finalVal.toFixed(2)),
        count: item.count,
      };
    });

    // Sort descending by value
    results.sort((a, b) => b.value - a.value);

    // Apply Top Limit
    if (topLimit > 0 && results.length > topLimit) {
      const topItems = results.slice(0, topLimit);
      const remainingItems = results.slice(topLimit);

      const otherVal = remainingItems.reduce((acc, curr) => acc + curr.value, 0);
      topItems.push({
        category: 'Other (Combined)',
        value: Number(otherVal.toFixed(2)),
        count: remainingItems.reduce((acc, curr) => acc + curr.count, 0),
      });
      return topItems;
    }

    return results;
  }, [data, xAxisCol, yAxisCol, aggregation, topLimit]);

  // Export chart data
  const handleExportChartData = () => {
    if (chartData.length === 0) return;
    exportToCsv(
      chartData,
      ['category', 'value', 'count'],
      `datalens-chart-${xAxisCol}-${aggregation}-${yAxisCol}.csv`
    );
  };

  const currentColors = PALETTES[colorTheme] || PALETTES.amber;

  const renderTooltip = (props) => (
    <ChartTooltip
      {...props}
      currentColors={currentColors}
      aggregation={aggregation}
      yAxisCol={yAxisCol}
      xAxisCol={xAxisCol}
    />
  );

  return (
    <div className="space-y-4">
      {/* Chart Builder Controls Bar */}
      <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-4 shadow-lg space-y-4">
        {/* Top Controls: Chart Type, Dimensions & Aggregation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Chart Type Selector */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Chart Type
            </label>
            <div className="flex rounded-lg border border-white/10 bg-[#0B0E13] p-1">
              {[
                { id: 'bar', label: 'Bar', icon: BarChart3 },
                { id: 'line', label: 'Line', icon: LineIcon },
                { id: 'area', label: 'Area', icon: AreaIcon },
                { id: 'pie', label: 'Pie', icon: PieIcon },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setChartType(t.id)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-xs font-medium transition-all ${
                      chartType === t.id
                        ? 'bg-amber-500 text-black shadow font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension / X-Axis */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Dimension (X-Axis)
            </label>
            <select
              value={xAxisCol}
              onChange={(e) => setXAxisCol(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Metric / Y-Axis (Disabled if count) */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Metric (Y-Axis)
            </label>
            <select
              value={yAxisCol}
              onChange={(e) => setYAxisCol(e.target.value)}
              disabled={aggregation === 'count'}
              className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none disabled:opacity-40"
            >
              {numericColumns.length > 0 ? (
                numericColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))
              ) : (
                columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Aggregation Function */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Aggregation
            </label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="sum">Sum</option>
              <option value="avg">Average (Mean)</option>
              <option value="count">Count of Rows</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </select>
          </div>

          {/* Top Limit */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Limit Categories
            </label>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value={5}>Top 5 Categories</option>
              <option value={10}>Top 10 Categories</option>
              <option value={15}>Top 15 Categories</option>
              <option value={25}>Top 25 Categories</option>
              <option value={0}>All Categories (No Limit)</option>
            </select>
          </div>
        </div>

        {/* Secondary Bar: Palette & Display Toggles & Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span>Theme:</span>
              <div className="flex items-center gap-1.5">
                {Object.keys(PALETTES).map((name) => (
                  <button
                    key={name}
                    onClick={() => setColorTheme(name)}
                    className={`h-5 w-5 rounded-full border transition-all ${
                      colorTheme === name
                        ? 'border-white scale-110 shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: PALETTES[name][0] }}
                    title={`${name} palette`}
                  />
                ))}
              </div>
            </div>

            {/* Grid & Legend Toggles */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-white/10 bg-[#0B0E13] text-amber-500 focus:ring-0"
              />
              <span>Grid lines</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="rounded border-white/10 bg-[#0B0E13] text-amber-500 focus:ring-0"
              />
              <span>Legend</span>
            </label>
          </div>

          <button
            onClick={handleExportChartData}
            disabled={chartData.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-amber-500/40 hover:bg-white/10 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Export Aggregated CSV</span>
          </button>
        </div>
      </div>

      {/* Main Chart Visualization Card */}
      <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              {aggregation.toUpperCase()} of {aggregation === 'count' ? 'Records' : yAxisCol} by {xAxisCol}
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated across {data.length.toLocaleString()} records • {chartData.length} unique segments
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-80 items-center justify-center text-slate-500 text-sm">
            No chartable data available for selected columns.
          </div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />}
                  <XAxis
                    dataKey="category"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip content={renderTooltip} />
                  {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                  <Bar
                    dataKey="value"
                    name={`${aggregation} of ${aggregation === 'count' ? 'Records' : yAxisCol}`}
                    fill={currentColors[0]}
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={currentColors[index % currentColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />}
                  <XAxis
                    dataKey="category"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip content={renderTooltip} />
                  {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={`${aggregation} of ${aggregation === 'count' ? 'Records' : yAxisCol}`}
                    stroke={currentColors[0]}
                    strokeWidth={2.5}
                    dot={{ fill: currentColors[0], r: 4 }}
                    activeDot={{ r: 6, fill: '#FFFFFF' }}
                  />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />}
                  <XAxis
                    dataKey="category"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip content={renderTooltip} />
                  {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentColors[0]} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={currentColors[0]} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={`${aggregation} of ${aggregation === 'count' ? 'Records' : yAxisCol}`}
                    stroke={currentColors[0]}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              ) : (
                <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <Tooltip content={renderTooltip} />
                  {showLegend && <Legend />}
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={currentColors[index % currentColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
