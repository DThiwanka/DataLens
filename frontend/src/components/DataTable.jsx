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
import { FILTER_OPERATORS, filterDataset, sortDataset, paginateDataset } from '../services/dataFilters.js';
import { exportToCsv } from '../services/csvExporter.js';

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

  // Add new filter condition
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
    <div className="space-y-3">
      {/* Action Toolbar */}
      <div className="flex flex-col gap-2.5 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Global Search & Quick Actions */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Global Search Input */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search in all columns..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded border border-gray-300 bg-white py-1.5 pl-8 pr-7 text-xs text-gray-900 placeholder-gray-400 focus:border-amber-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilterDrawer((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              filters.length > 0
                ? 'border-amber-500 bg-amber-50 text-amber-800'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-3.5 w-3.5 text-gray-500" />
            <span>Filter</span>
            {filters.length > 0 && (
              <span className="ml-1 rounded bg-amber-600 px-1 py-0.2 text-[10px] font-bold text-white">
                {filters.length}
              </span>
            )}
          </button>

          {/* Column Visibility Toggle */}
          <button
            onClick={() => setShowColumnDrawer((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500" />
            <span>Columns</span>
            <span className="text-[11px] text-gray-400">
              ({activeColumns.length}/{columns.length})
            </span>
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Record Counter & Export */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2 sm:border-t-0 sm:pt-0">
          <span className="text-xs text-gray-500">
            Showing <strong className="font-semibold text-gray-800">{filteredData.length === 0 ? 0 : pagination.startIndex + 1}–{pagination.endIndex}</strong> of <strong className="font-semibold text-gray-800">{filteredData.length.toLocaleString()}</strong> rows
          </span>

          <button
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Builder Panel */}
      {showFilterDrawer && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Filter conditions ({filters.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddFilter}
                className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-3 w-3" />
                <span>Add condition</span>
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="rounded p-0.5 text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {filters.length === 0 ? (
            <p className="text-xs text-gray-500 py-1">
              No active conditions. Click &ldquo;Add condition&rdquo; to filter rows by specific columns.
            </p>
          ) : (
            <div className="space-y-2">
              {filters.map((filter, idx) => (
                <div
                  key={filter.id}
                  className="flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-white p-2 text-xs"
                >
                  <span className="text-[11px] font-mono text-gray-400 w-12">
                    {idx === 0 ? 'Where' : 'And'}
                  </span>

                  {/* Column Select */}
                  <select
                    value={filter.column}
                    onChange={(e) => handleUpdateFilter(filter.id, 'column', e.target.value)}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
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
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
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
                      placeholder="Value..."
                      value={filter.value}
                      onChange={(e) => handleUpdateFilter(filter.id, 'value', e.target.value)}
                      className="min-w-[120px] flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-600 focus:outline-none"
                    />
                  )}

                  {/* Value 2 Input */}
                  {filter.operator === 'between' && (
                    <input
                      type="text"
                      placeholder="High value..."
                      value={filter.value2}
                      onChange={(e) => handleUpdateFilter(filter.id, 'value2', e.target.value)}
                      className="min-w-[100px] flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-600 focus:outline-none"
                    />
                  )}

                  {/* Delete Filter */}
                  <button
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="rounded p-1 text-gray-400 hover:text-red-600"
                    title="Remove filter"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Column Visibility Selector Panel */}
      {showColumnDrawer && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Visible columns ({activeColumns.length} of {columns.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={showAllColumns}
                className="text-[11px] text-[#C58A16] hover:underline"
              >
                Show all
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={hideAllExceptFirst}
                className="text-[11px] text-gray-500 hover:underline"
              >
                Reset
              </button>
              <button
                onClick={() => setShowColumnDrawer(false)}
                className="rounded p-0.5 text-gray-400 hover:text-gray-700 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {columns.map((col) => {
              const isVisible = visibleColumns[col] !== false;
              return (
                <button
                  key={col}
                  onClick={() => toggleColumnVisibility(col)}
                  className={`flex items-center gap-1.5 rounded border px-2 py-1 text-left text-xs transition-colors ${
                    isVisible
                      ? 'border-gray-300 bg-white text-gray-800'
                      : 'border-transparent bg-gray-200/50 text-gray-400'
                  }`}
                >
                  {isVisible ? (
                    <Eye className="h-3 w-3 text-amber-700 shrink-0" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400 shrink-0" />
                  )}
                  <span className="truncate font-mono text-[11px]">{col}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur-xs">
              <tr>
                <th className="w-10 px-2.5 py-2 font-medium text-gray-500 text-center border-r border-gray-200">
                  #
                </th>
                {activeColumns.map((col) => {
                  const isSorted = sortState.column === col;
                  return (
                    <th
                      key={col}
                      onClick={() => handleSortClick(col)}
                      className="cursor-pointer select-none px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100/70 border-r border-gray-200 last:border-r-0"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate font-mono text-xs text-gray-700">
                          {col}
                        </span>
                        <div className="text-gray-400">
                          {isSorted ? (
                            sortState.direction === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5 text-amber-700" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-amber-700" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-800">
              {pagination.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeColumns.length + 1}
                    className="py-12 text-center text-gray-500"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-1.5">
                      <TableProperties className="h-8 w-8 text-gray-300 mb-1" />
                      <p className="text-xs font-semibold text-gray-700">No matching records found</p>
                      <p className="text-[11px] text-gray-500">
                        {isFiltered
                          ? 'Try adjusting or clearing your current filter criteria.'
                          : 'The active dataset contains no rows.'}
                      </p>
                      {isFiltered && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-1 text-xs text-[#C58A16] hover:underline"
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
                      className="transition-colors hover:bg-gray-50/60"
                    >
                      <td className="px-2.5 py-1.5 text-center font-mono text-[11px] text-gray-400 border-r border-gray-100">
                        {absoluteIndex}
                      </td>
                      {activeColumns.map((col) => {
                        const cellVal = row[col];
                        const isEmpty = cellVal === null || cellVal === undefined || cellVal === '';
                        return (
                          <td
                            key={col}
                            className="max-w-[260px] truncate px-3 py-1.5 font-mono text-xs border-r border-gray-100 last:border-r-0"
                            title={isEmpty ? '(empty)' : String(cellVal)}
                          >
                            {isEmpty ? (
                              <span className="text-gray-300 italic text-[11px]">null</span>
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

        {/* Footer with Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/50 px-3 py-2 text-xs">
          {/* Rows Per Page */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>

          {/* Page Indicator & Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">
              Page <strong className="font-semibold text-gray-800">{pagination.currentPage}</strong> of{' '}
              <strong className="font-semibold text-gray-800">{pagination.totalPages}</strong>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage <= 1}
                className="rounded border border-gray-300 bg-white p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="rounded border border-gray-300 bg-white p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
