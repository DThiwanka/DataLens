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
import { exportToCsv } from '../services/csvExporter.js';
import { isNullOrEmpty, isNumeric } from '../utils/dataTypes.js';
import { formatNumber, formatCompactNumber } from '../utils/formatters.js';

const PALETTES = {
  amber: ['#C58A16', '#D97706', '#B45309', '#92400E', '#78350F'],
  slate: ['#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1'],
  blue: ['#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
  emerald: ['#047857', '#059669', '#10B981', '#34D399', '#6EE7B7'],
};

// Clean Light Tooltip
function ChartTooltip({ active, payload, label, currentColors, aggregation, yAxisCol, xAxisCol }) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    return (
      <div className="rounded border border-gray-200 bg-white p-2.5 shadow-md text-xs">
        <p className="font-medium text-gray-900">{label || dataPoint.payload?.category}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: dataPoint.color || currentColors[0] }}
          />
          <span className="text-gray-500 capitalize">
            {aggregation} of {aggregation === 'count' ? 'rows' : (yAxisCol || xAxisCol)}:
          </span>
          <span className="font-semibold font-mono text-gray-900">
            {formatNumber(dataPoint.value)}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-gray-400">
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
  const numericColumns = useMemo(() => {
    return columnProfiles.filter((p) => p.type === 'numeric').map((p) => p.name);
  }, [columnProfiles]);

  const categoricalColumns = useMemo(() => {
    return columnProfiles.filter((p) => p.type !== 'numeric').map((p) => p.name);
  }, [columnProfiles]);

  // Chart Configuration State
  const [chartType, setChartType] = useState('bar');
  const [xAxisCol, setXAxisCol] = useState(() => {
    if (initialCategoryCol && columns.includes(initialCategoryCol)) return initialCategoryCol;
    return categoricalColumns[0] || columns[0] || '';
  });
  const [yAxisCol, setYAxisCol] = useState(() => {
    if (initialMeasureCol && columns.includes(initialMeasureCol)) return initialMeasureCol;
    return numericColumns[0] || columns[1] || '';
  });
  const [aggregation, setAggregation] = useState('sum');
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
        category: 'Other',
        value: Number(otherVal.toFixed(2)),
        count: remainingItems.reduce((acc, curr) => acc + curr.count, 0),
      });
      return topItems;
    }

    return results;
  }, [data, xAxisCol, yAxisCol, aggregation, topLimit]);

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
      {/* Chart Configuration Controls Bar */}
      <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Chart Type Selector */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">
              Chart type
            </label>
            <div className="flex rounded border border-gray-300 bg-gray-50 p-0.5">
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
                    className={`flex flex-1 items-center justify-center gap-1 rounded py-1 text-xs font-medium transition-colors ${
                      chartType === t.id
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension (X-Axis) */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">
              Category (X-axis)
            </label>
            <select
              value={xAxisCol}
              onChange={(e) => setXAxisCol(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-amber-600 focus:outline-none"
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Metric (Y-Axis) */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">
              Metric (Y-axis)
            </label>
            <select
              value={yAxisCol}
              onChange={(e) => setYAxisCol(e.target.value)}
              disabled={aggregation === 'count'}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-amber-600 focus:outline-none disabled:opacity-40"
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

          {/* Aggregation */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">
              Aggregation
            </label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-amber-600 focus:outline-none"
            >
              <option value="sum">Sum</option>
              <option value="avg">Average</option>
              <option value="count">Count of rows</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </select>
          </div>

          {/* Limit Categories */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">
              Limit categories
            </label>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-amber-600 focus:outline-none"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={25}>Top 25</option>
              <option value={0}>All (No limit)</option>
            </select>
          </div>
        </div>

        {/* Secondary Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            {/* Palette */}
            <div className="flex items-center gap-1.5">
              <span>Theme:</span>
              <div className="flex items-center gap-1">
                {Object.keys(PALETTES).map((name) => (
                  <button
                    key={name}
                    onClick={() => setColorTheme(name)}
                    className={`h-4 w-4 rounded-full border transition-transform ${
                      colorTheme === name
                        ? 'border-gray-800 scale-110 shadow-xs'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: PALETTES[name][0] }}
                    title={`${name} palette`}
                  />
                ))}
              </div>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-0"
              />
              <span>Grid</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-0"
              />
              <span>Legend</span>
            </label>
          </div>

          <button
            onClick={handleExportChartData}
            disabled={chartData.length === 0}
            className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <Download className="h-3 w-3 text-gray-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <div className="mb-3 border-b border-gray-100 pb-2">
          <h3 className="text-sm font-semibold text-gray-900">
            {aggregation.toUpperCase()} of {aggregation === 'count' ? 'rows' : yAxisCol} by {xAxisCol}
          </h3>
          <p className="text-xs text-gray-500">
            {data.length.toLocaleString()} total records • {chartData.length} distinct groups displayed
          </p>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-xs text-gray-400">
            No chartable data available for the chosen configuration.
          </div>
        ) : (
          <div className="h-88 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 50 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />}
                  <XAxis
                    dataKey="category"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip content={renderTooltip} />
                  {showLegend && <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }} />}
                  <Bar
                    dataKey="value"
                    name={`${aggregation} of ${aggregation === 'count' ? 'rows' : yAxisCol}`}
                    fill={currentColors[0]}
                    radius={[2, 2, 0, 0]}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={currentColors[index % currentColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 50 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />}
                  <XAxis
                    dataKey="category"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip content={renderTooltip} />
                  {showLegend && <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }} />}
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={`${aggregation} of ${aggregation === 'count' ? 'rows' : yAxisCol}`}
                    stroke={currentColors[0]}
                    strokeWidth={2}
                    dot={{ fill: currentColors[0], r: 3 }}
                    activeDot={{ r: 5, fill: currentColors[0] }}
                  />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 50 }}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />}
                  <XAxis
                    dataKey="category"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip content={renderTooltip} />
                  {showLegend && <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }} />}
                  <defs>
                    <linearGradient id="areaGradientLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentColors[0]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={currentColors[0]} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={`${aggregation} of ${aggregation === 'count' ? 'rows' : yAxisCol}`}
                    stroke={currentColors[0]}
                    strokeWidth={2}
                    fill="url(#areaGradientLight)"
                  />
                </AreaChart>
              ) : (
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Tooltip content={renderTooltip} />
                  {showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {chartData.map((_, index) => (
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
