import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  RotateCcw,
  SlidersHorizontal,
  TableProperties,
} from 'lucide-react';
import { FILTER_OPERATORS, filterDataset, sortDataset, paginateDataset } from '../services/dataFilters';
import { exportToCsv } from '../services/csvExporter';

export default function DataTable({
  data = [],
  columns = [],
  _columnProfiles = [],
  onExportFiltered,
}) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState([]);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showColumnDrawer, setShowColumnDrawer] = useState(false);

  // Column Visibility State: Record<columnName, boolean>
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const initial = {};
    columns.forEach((c) => (initial[c] = true));
    return initial;
  });

  // Sort State: { column: null, direction: 'asc'|'desc'|null }
  const [sortState, setSortState] = useState({ column: null, direction: null });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return filterDataset(data, columns, searchQuery, filters);
  }, [data, columns, searchQuery, filters]);

  // Sorted dataset
  const sortedData = useMemo(() => {
    return sortDataset(filteredData, sortState.column, sortState.direction);
  }, [filteredData, sortState.column, sortState.direction]);

  // Paginated dataset
  const pagination = useMemo(() => {
    return paginateDataset(sortedData, currentPage, pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Active columns to render
  const activeColumns = useMemo(() => {
    return columns.filter((c) => visibleColumns[c] !== false);
  }, [columns, visibleColumns]);

  // Handle Header Sort Click
  const handleSortClick = (col) => {
    setCurrentPage(1);
    setSortState((prev) => {
      if (prev.column === col) {
        if (prev.direction === 'asc') return { column: col, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column: col, direction: 'asc' };
    });
  };

  // Add new blank filter condition
  const handleAddFilter = () => {
    const newFilter = {
      id: Date.now().toString(),
      column: columns[0] || '',
      operator: 'contains',
      value: '',
      value2: '',
    };
    setFilters((prev) => [...prev, newFilter]);
    setShowFilterDrawer(true);
  };

  const handleUpdateFilter = (id, field, value) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
    setCurrentPage(1);
  };

  const handleRemoveFilter = (id) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters([]);
    setCurrentPage(1);
  };

  // Toggle single column visibility
  const toggleColumnVisibility = (col) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  // Select all or reset columns
  const showAllColumns = () => {
    const all = {};
    columns.forEach((c) => (all[c] = true));
    setVisibleColumns(all);
  };

  const hideAllExceptFirst = () => {
    const obj = {};
    columns.forEach((c, idx) => {
      obj[c] = idx === 0;
    });
    setVisibleColumns(obj);
  };

  // Export currently filtered results
  const handleExport = () => {
    if (onExportFiltered) {
      onExportFiltered(sortedData, activeColumns);
    } else {
      exportToCsv(sortedData, activeColumns, 'datalens-filtered-data.csv');
    }
  };

  const isFiltered = searchQuery.trim() !== '' || filters.length > 0;

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#141820]/90 p-4 shadow-lg lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Global Search & Quick Actions */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Global Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search across all records..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-white/10 bg-[#0B0E13] py-2 pl-9.5 pr-4 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilterDrawer((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              filters.length > 0
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
            {filters.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-black">
                {filters.length}
              </span>
            )}
          </button>

          {/* Column Visibility Toggle */}
          <button
            onClick={() => setShowColumnDrawer((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>Columns</span>
            <span className="text-[10px] text-slate-400">
              ({activeColumns.length}/{columns.length})
            </span>
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Record Counter & Export */}
        <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-3 lg:border-t-0 lg:pt-0">
          <div className="text-xs text-slate-400">
            Showing{' '}
            <span className="font-semibold text-white">
              {filteredData.length === 0 ? 0 : pagination.startIndex + 1} -{' '}
              {pagination.endIndex}
            </span>{' '}
            of <span className="font-semibold text-white">{filteredData.length.toLocaleString()}</span>{' '}
            {isFiltered && (
              <span className="text-slate-500">
                (filtered from {data.length.toLocaleString()} total)
              </span>
            )}
          </div>

          <button
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all hover:border-amber-500/60 hover:bg-amber-500/20 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Builder Panel */}
      {showFilterDrawer && (
        <div className="rounded-xl border border-amber-500/20 bg-[#161c26] p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Filter Conditions ({filters.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddFilter}
                className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20"
              >
                <Plus className="h-3 w-3" />
                <span>Add Filter</span>
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {filters.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              No active filters. Click &ldquo;Add Filter&rdquo; to constrain records by specific column conditions.
            </p>
          ) : (
            <div className="space-y-2.5">
              {filters.map((filter, idx) => (
                <div
                  key={filter.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-white/5 bg-[#0B0E13] p-2.5"
                >
                  <span className="text-[11px] font-mono text-slate-500 px-1">
                    {idx === 0 ? 'WHERE' : 'AND'}
                  </span>

                  {/* Column Select */}
                  <select
                    value={filter.column}
                    onChange={(e) => handleUpdateFilter(filter.id, 'column', e.target.value)}
                    className="rounded border border-white/10 bg-[#141820] px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Operator Select */}
                  <select
                    value={filter.operator}
                    onChange={(e) => handleUpdateFilter(filter.id, 'operator', e.target.value)}
                    className="rounded border border-white/10 bg-[#141820] px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {FILTER_OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {/* Value 1 Input */}
                  {filter.operator !== 'is_empty' && filter.operator !== 'is_not_empty' && (
                    <input
                      type="text"
                      placeholder="Value to match..."
                      value={filter.value}
                      onChange={(e) => handleUpdateFilter(filter.id, 'value', e.target.value)}
                      className="min-w-[140px] flex-1 rounded border border-white/10 bg-[#141820] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  )}

                  {/* Value 2 Input (For between operator) */}
                  {filter.operator === 'between' && (
                    <input
                      type="text"
                      placeholder="High value..."
                      value={filter.value2}
                      onChange={(e) => handleUpdateFilter(filter.id, 'value2', e.target.value)}
                      className="min-w-[120px] flex-1 rounded border border-white/10 bg-[#141820] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  )}

                  {/* Delete Filter Button */}
                  <button
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="rounded p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Column Visibility Selector Panel */}
      {showColumnDrawer && (
        <div className="rounded-xl border border-white/10 bg-[#161c26] p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Manage Visible Columns ({activeColumns.length} of {columns.length} visible)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={showAllColumns}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={hideAllExceptFirst}
                className="text-[11px] text-slate-400 hover:underline"
              >
                Reset
              </button>
              <button
                onClick={() => setShowColumnDrawer(false)}
                className="rounded p-1 text-slate-400 hover:text-white ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
            {columns.map((col) => {
              const isVisible = visibleColumns[col] !== false;
              return (
                <button
                  key={col}
                  onClick={() => toggleColumnVisibility(col)}
                  className={`flex items-center gap-2 rounded border px-2.5 py-1.5 text-left text-xs transition-all ${
                    isVisible
                      ? 'border-amber-500/30 bg-amber-500/10 text-slate-200'
                      : 'border-white/5 bg-white/[0.02] text-slate-500'
                  }`}
                >
                  {isVisible ? (
                    <Eye className="h-3 w-3 text-amber-400 shrink-0" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-slate-500 shrink-0" />
                  )}
                  <span className="truncate">{col}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[#141820]/90 shadow-xl">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header */}
            <thead className="sticky top-0 z-10 border-b border-white/10 bg-[#161c26]">
              <tr>
                <th className="w-12 px-3 py-3 font-semibold text-slate-400 text-center border-r border-white/5">
                  #
                </th>
                {activeColumns.map((col) => {
                  const isSorted = sortState.column === col;
                  return (
                    <th
                      key={col}
                      onClick={() => handleSortClick(col)}
                      className="group cursor-pointer select-none px-4 py-3 font-semibold text-slate-300 transition-colors hover:bg-white/5 border-r border-white/5 last:border-r-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-slate-200 group-hover:text-amber-400">
                          {col}
                        </span>
                        <div className="text-slate-500 group-hover:text-slate-300">
                          {isSorted ? (
                            sortState.direction === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-amber-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/5 text-slate-300">
              {pagination.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeColumns.length + 1}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-2">
                      <TableProperties className="h-10 w-10 text-slate-600 mb-1" />
                      <p className="text-sm font-semibold text-slate-300">No records found</p>
                      <p className="text-xs text-slate-500">
                        {isFiltered
                          ? 'No rows match your current search and filter conditions.'
                          : 'This dataset is currently empty.'}
                      </p>
                      {isFiltered && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 text-xs text-amber-400 hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pagination.rows.map((row, rowIdx) => {
                  const absoluteIndex = pagination.startIndex + rowIdx + 1;
                  return (
                    <tr
                      key={rowIdx}
                      className="transition-colors hover:bg-white/[0.03] odd:bg-transparent even:bg-white/[0.01]"
                    >
                      <td className="px-3 py-2.5 text-center font-mono text-[11px] text-slate-500 border-r border-white/5">
                        {absoluteIndex}
                      </td>
                      {activeColumns.map((col) => {
                        const cellVal = row[col];
                        const isEmpty = cellVal === null || cellVal === undefined || cellVal === '';
                        return (
                          <td
                            key={col}
                            className="max-w-[280px] truncate px-4 py-2.5 font-mono text-xs border-r border-white/5 last:border-r-0"
                            title={isEmpty ? '(empty)' : String(cellVal)}
                          >
                            {isEmpty ? (
                              <span className="text-slate-600 italic">null</span>
                            ) : (
                              <span>{String(cellVal)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/8 bg-[#161c26] p-4 text-xs">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-slate-400">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-white/10 bg-[#0B0E13] px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Page <span className="font-semibold text-white">{pagination.currentPage}</span> of{' '}
              <span className="font-semibold text-white">{pagination.totalPages}</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage <= 1}
                className="rounded border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="rounded border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
