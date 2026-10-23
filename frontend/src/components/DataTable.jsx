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
  columnProfiles = [],
  onExportFiltered,
  searchQuery: externalSearch,
  onSearchChange: setExternalSearch,
  filters: externalFilters,
  onFiltersChange: setExternalFilters,
}) {
  // Search & Filter State
  const [internalSearch, setInternalSearch] = useState('');
  const [internalFilters, setInternalFilters] = useState([]);

  const searchQuery = externalSearch !== undefined ? externalSearch : internalSearch;
  const setSearchQuery = setExternalSearch || setInternalSearch;

  const filters = externalFilters !== undefined ? externalFilters : internalFilters;
  const setFilters = setExternalFilters || setInternalFilters;

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showColumnDrawer, setShowColumnDrawer] = useState(false);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const initial = {};
    columns.forEach((c) => (initial[c] = true));
    return initial;
  });

  // Numeric columns set for alignment and tabular numerals
  const numericColumnSet = useMemo(() => {
    const set = new Set();
    columnProfiles.forEach((p) => {
      if (p.type === 'numeric') set.add(p.name);
    });
    return set;
  }, [columnProfiles]);

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

  // Filter operations
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

  // Column visibility operations
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

  // Export
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
      {/* 1. Compact Table Toolbar */}
      <div className="flex flex-col gap-2 rounded border border-[#E3E6EB] bg-[#FFFFFF] p-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Search & Filter Trigger */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#89919F]" />
            <input
              type="text"
              placeholder="Search across all columns..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] py-1 pl-8 pr-7 text-xs text-[#20242C] placeholder-[#89919F] focus:border-[#B98220] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#89919F] hover:text-[#20242C]"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilterDrawer((prev) => !prev)}
            className={`inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition-colors ${
              filters.length > 0
                ? 'border-[#B98220] bg-amber-50/40 text-[#B98220]'
                : 'border-[#E3E6EB] bg-[#FFFFFF] text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB]'
            }`}
          >
            <Filter className="h-3.5 w-3.5 text-[#89919F]" />
            <span>Filter</span>
            {filters.length > 0 && (
              <span className="ml-0.5 rounded bg-[#B98220] px-1 py-0.2 text-[10px] font-bold text-white">
                {filters.length}
              </span>
            )}
          </button>

          {/* Column Visibility Button */}
          <button
            onClick={() => setShowColumnDrawer((prev) => !prev)}
            className="inline-flex h-8 items-center gap-1.5 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#89919F]" />
            <span>Columns</span>
            <span className="text-[11px] font-mono text-[#89919F]">
              ({activeColumns.length}/{columns.length})
            </span>
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-1.5 text-xs text-[#89919F] hover:text-[#20242C] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Quick Record Count & Export */}
        <div className="flex items-center justify-between gap-3 pt-1 sm:pt-0">
          <span className="text-xs text-[#667085]">
            <span className="font-mono font-medium text-[#20242C]">{filteredData.length.toLocaleString()}</span> rows
          </span>

          <button
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="inline-flex h-8 items-center gap-1.5 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[#89919F]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Active Filter Chips Bar */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded border border-[#E3E6EB] bg-[#F7F8FA] px-3 py-1.5 text-xs">
          <span className="text-[11px] font-medium text-[#89919F] mr-1">Active filters:</span>
          {filters.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1.5 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 py-0.5 text-xs text-[#20242C]"
            >
              <span className="font-mono font-medium">{f.column}</span>
              <span className="text-[#89919F]">{f.operator.replace('_', ' ')}</span>
              {f.value && <span className="font-semibold">{f.value}</span>}
              <button
                onClick={() => handleRemoveFilter(f.id)}
                className="text-[#89919F] hover:text-red-600 ml-0.5"
                aria-label={`Remove filter on ${f.column}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-[#B98220] hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Builder Drawer */}
      {showFilterDrawer && (
        <div className="rounded border border-[#E3E6EB] bg-[#F7F8FA] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#20242C]">
              Filter conditions ({filters.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddFilter}
                className="inline-flex h-7 items-center gap-1 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA]"
              >
                <Plus className="h-3 w-3" />
                <span>Add condition</span>
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="rounded p-0.5 text-[#89919F] hover:text-[#20242C]"
                aria-label="Close filter panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filters.map((filter, idx) => (
              <div
                key={filter.id}
                className="flex flex-wrap items-center gap-2 rounded border border-[#E3E6EB] bg-[#FFFFFF] p-2 text-xs"
              >
                <span className="text-[11px] font-mono text-[#89919F] w-12">
                  {idx === 0 ? 'Where' : 'And'}
                </span>

                {/* Column Select */}
                <select
                  value={filter.column}
                  onChange={(e) => handleUpdateFilter(filter.id, 'column', e.target.value)}
                  className="h-7 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
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
                  className="h-7 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
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
                    className="h-7 min-w-[120px] flex-1 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] placeholder-[#89919F] focus:border-[#B98220] focus:outline-none"
                  />
                )}

                {/* Value 2 Input */}
                {filter.operator === 'between' && (
                  <input
                    type="text"
                    placeholder="High value..."
                    value={filter.value2}
                    onChange={(e) => handleUpdateFilter(filter.id, 'value2', e.target.value)}
                    className="h-7 min-w-[100px] flex-1 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] placeholder-[#89919F] focus:border-[#B98220] focus:outline-none"
                  />
                )}

                {/* Delete Filter */}
                <button
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="rounded p-1 text-[#89919F] hover:text-red-600 transition-colors"
                  title="Remove condition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Column Visibility Selector Panel */}
      {showColumnDrawer && (
        <div className="rounded border border-[#E3E6EB] bg-[#F7F8FA] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#20242C]">
              Visible columns ({activeColumns.length} of {columns.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={showAllColumns}
                className="text-[11px] text-[#B98220] hover:underline"
              >
                Show all
              </button>
              <span className="text-[#89919F]">·</span>
              <button
                onClick={hideAllExceptFirst}
                className="text-[11px] text-[#667085] hover:underline"
              >
                Reset
              </button>
              <button
                onClick={() => setShowColumnDrawer(false)}
                className="rounded p-0.5 text-[#89919F] hover:text-[#20242C] ml-1"
                aria-label="Close columns panel"
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
                      ? 'border-[#E3E6EB] bg-[#FFFFFF] text-[#20242C]'
                      : 'border-transparent bg-[#F1F3F5] text-[#89919F]'
                  }`}
                >
                  {isVisible ? (
                    <Eye className="h-3 w-3 text-[#B98220] shrink-0" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-[#89919F] shrink-0" />
                  )}
                  <span className="truncate font-mono text-[11px]">{col}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Analytical Data Table */}
      <div className="overflow-hidden rounded border border-[#E3E6EB] bg-[#FFFFFF]">
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-[#E3E6EB] bg-[#F7F8FA] text-[#667085]">
              <tr>
                <th className="w-12 px-2.5 py-2 font-medium text-center border-r border-[#E3E6EB] text-[#89919F]">
                  #
                </th>
                {activeColumns.map((col) => {
                  const isSorted = sortState.column === col;
                  const isNumericCol = numericColumnSet.has(col);
                  return (
                    <th
                      key={col}
                      onClick={() => handleSortClick(col)}
                      className={`cursor-pointer select-none px-3 py-2 font-medium text-[#20242C] hover:bg-[#F1F3F5] transition-colors border-r border-[#E3E6EB] last:border-r-0 ${
                        isNumericCol ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 ${isNumericCol ? 'justify-end' : 'justify-between'}`}>
                        <span className="truncate font-mono text-xs">
                          {col}
                        </span>
                        <div className="text-[#89919F]">
                          {isSorted ? (
                            sortState.direction === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5 text-[#B98220]" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-[#B98220]" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E3E6EB] text-[#20242C]">
              {pagination.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeColumns.length + 1}
                    className="py-12 text-center text-[#89919F]"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-1.5">
                      <TableProperties className="h-7 w-7 text-[#D1D5DB] mb-1" />
                      <p className="text-xs font-semibold text-[#20242C]">No matching records found</p>
                      <p className="text-[11px] text-[#89919F]">
                        {isFiltered
                          ? 'Adjust or clear your active search query and filter criteria.'
                          : 'The active dataset contains no rows.'}
                      </p>
                      {isFiltered && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-1 text-xs text-[#B98220] font-medium hover:underline"
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
                      className="hover:bg-[#F7F8FA] transition-colors"
                    >
                      <td className="px-2.5 py-1.5 text-center font-mono text-[11px] text-[#89919F] border-r border-[#E3E6EB]">
                        {absoluteIndex}
                      </td>
                      {activeColumns.map((col) => {
                        const cellVal = row[col];
                        const isEmpty = cellVal === null || cellVal === undefined || cellVal === '';
                        const isNumericCol = numericColumnSet.has(col);
                        return (
                          <td
                            key={col}
                            className={`max-w-[280px] truncate px-3 py-1.5 font-mono text-xs border-r border-[#E3E6EB] last:border-r-0 ${
                              isNumericCol ? 'text-right tabular-nums' : 'text-left'
                            }`}
                            title={isEmpty ? '(empty)' : String(cellVal)}
                          >
                            {isEmpty ? (
                              <span className="text-[#89919F]/60 select-none">—</span>
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

        {/* 4. Pagination Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E3E6EB] bg-[#F7F8FA] px-3 py-2 text-xs">
          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 text-[#667085]">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>

          {/* Record range & page navigation */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#667085]">
              Showing <strong className="font-mono text-[#20242C]">{filteredData.length === 0 ? 0 : pagination.startIndex + 1}–{pagination.endIndex}</strong> of <strong className="font-mono text-[#20242C]">{filteredData.length.toLocaleString()}</strong> rows (Page {pagination.currentPage} of {pagination.totalPages})
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage <= 1}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#E3E6EB] bg-[#FFFFFF] text-[#20242C] hover:bg-[#F1F3F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#E3E6EB] bg-[#FFFFFF] text-[#20242C] hover:bg-[#F1F3F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page"
                aria-label="Next page"
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
