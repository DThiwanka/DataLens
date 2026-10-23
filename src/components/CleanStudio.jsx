import { useState } from 'react';
import {
  Trash2,
  Undo2,
  RotateCcw,
  Check,
  Download,
  CaseSensitive,
  AlignLeft,
  Columns,
  ArrowUpDown,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import {
  removeDuplicateRows,
  removeEmptyRows,
  removeEmptyColumns,
  dropColumns,
  reorderColumns,
  renameColumn,
  normalizeHeaders,
  trimWhitespace,
  findAndReplace,
  fillMissingValues,
  changeTextCase,
  normalizeNumericStrings,
} from '../services/dataCleaner.js';
import { exportToCsv } from '../services/csvExporter.js';

export default function CleanStudio({
  originalData = [],
  originalColumns = [],
  cleanedData = [],
  cleanedColumns = [],
  history = [],
  onApplyTransformation,
  onUndoTransformation,
  onResetToOriginal,
  onCommitCleanedToActive,
}) {
  const [activeTab, setActiveTab] = useState('rows'); // 'rows' | 'columns' | 'values' | 'text' | 'history'

  // Operation Forms State
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [findCol, setFindCol] = useState('all');
  const [matchType, setMatchType] = useState('exact');

  const [fillCol, setFillCol] = useState(cleanedColumns[0] || '');
  const [fillStrategy, setFillStrategy] = useState('custom');
  const [customFillValue, setCustomFillValue] = useState('');

  const [renameOldCol, setRenameOldCol] = useState(cleanedColumns[0] || '');
  const [renameNewCol, setRenameNewCol] = useState('');

  const [headerStyle, setHeaderStyle] = useState('snake_case');

  const [caseCol, setCaseCol] = useState('all');
  const [caseType, setCaseType] = useState('lowercase');

  const [numericCol, setNumericCol] = useState(cleanedColumns[0] || '');

  const [colsToDrop, setColsToDrop] = useState([]);

  // Derived fallback values ensuring dropdowns stay in sync without cascading renders
  const effectiveFillCol = cleanedColumns.includes(fillCol) ? fillCol : (cleanedColumns[0] || '');
  const effectiveRenameCol = cleanedColumns.includes(renameOldCol) ? renameOldCol : (cleanedColumns[0] || '');
  const effectiveNumericCol = cleanedColumns.includes(numericCol) ? numericCol : (cleanedColumns[0] || '');
  const effectiveFindCol = findCol === 'all' || cleanedColumns.includes(findCol) ? findCol : 'all';
  const effectiveCaseCol = caseCol === 'all' || cleanedColumns.includes(caseCol) ? caseCol : 'all';

  // Stats comparison
  const rowsDiff = cleanedData.length - originalData.length;
  const colsDiff = cleanedColumns.length - originalColumns.length;

  const handleApply = (result) => {
    onApplyTransformation(result);
  };

  const handleDropColumnToggle = (col) => {
    setColsToDrop((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const executeDropColumns = () => {
    if (colsToDrop.length === 0) return;
    if (colsToDrop.length >= cleanedColumns.length) {
      alert('Cannot drop all columns. At least one column must remain in the dataset.');
      return;
    }
    const res = dropColumns(cleanedData, cleanedColumns, colsToDrop);
    handleApply(res);
    setColsToDrop([]);
  };

  const handleResetClick = () => {
    if (history.length > 0) {
      if (window.confirm('Reset all cleaning transformations and restore the original dataset?')) {
        onResetToOriginal();
      }
    }
  };

  const executeMoveColumn = (col, direction) => {
    const idx = cleanedColumns.indexOf(col);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cleanedColumns.length) return;

    const newCols = [...cleanedColumns];
    const temp = newCols[idx];
    newCols[idx] = newCols[targetIdx];
    newCols[targetIdx] = temp;

    const res = reorderColumns(cleanedData, cleanedColumns, newCols);
    handleApply(res);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Status & Actions */}
      <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#20242C]">
              Cleaning Studio
            </h2>
            <p className="text-xs text-[#667085]">
              Deterministic in-browser transformations with complete audit history and instant rollback.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onUndoTransformation}
              disabled={history.length === 0}
              className="inline-flex h-8 items-center gap-1 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
              title="Undo last transformation"
            >
              <Undo2 className="h-3.5 w-3.5 text-[#667085]" />
              <span>Undo</span>
            </button>

            <button
              onClick={handleResetClick}
              disabled={history.length === 0}
              className="inline-flex h-8 items-center gap-1 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
              title="Reset all changes to original source"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#667085]" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => exportToCsv(cleanedData, cleanedColumns, 'datalens-cleaned-data.csv')}
              className="inline-flex h-8 items-center gap-1 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-[#667085]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onCommitCleanedToActive}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#B98220] px-3 text-xs font-medium text-white hover:bg-[#9D6D17] transition-colors shadow-xs"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply to active dataset</span>
            </button>
          </div>
        </div>

        {/* Diff Summary Strip */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-[#E3E6EB] pt-2.5 text-xs">
          <div className="rounded bg-[#F7F8FA] p-2 border border-[#E3E6EB]">
            <span className="text-[10px] text-[#89919F] block">Working Rows</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-semibold text-[#20242C] font-mono">{cleanedData.length.toLocaleString()}</span>
              {rowsDiff !== 0 && (
                <span className={`text-[11px] font-mono font-medium ${rowsDiff < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ({rowsDiff > 0 ? `+${rowsDiff}` : rowsDiff})
                </span>
              )}
            </div>
          </div>

          <div className="rounded bg-[#F7F8FA] p-2 border border-[#E3E6EB]">
            <span className="text-[10px] text-[#89919F] block">Working Columns</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-semibold text-[#20242C] font-mono">{cleanedColumns.length}</span>
              {colsDiff !== 0 && (
                <span className={`text-[11px] font-mono font-medium ${colsDiff < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  ({colsDiff > 0 ? `+${colsDiff}` : colsDiff})
                </span>
              )}
            </div>
          </div>

          <div className="rounded bg-[#F7F8FA] p-2 border border-[#E3E6EB]">
            <span className="text-[10px] text-[#89919F] block">Original Source</span>
            <span className="font-medium text-emerald-700 font-mono mt-0.5 block">Immutable ({originalData.length} rows)</span>
          </div>

          <div className="rounded bg-[#F7F8FA] p-2 border border-[#E3E6EB]">
            <span className="text-[10px] text-[#89919F] block">Applied Transformations</span>
            <span className="font-semibold text-[#20242C] font-mono mt-0.5 block">{history.length} steps</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E3E6EB] gap-1 text-xs overflow-x-auto">
        {[
          { id: 'rows', label: 'Rows' },
          { id: 'columns', label: 'Columns & Headers' },
          { id: 'values', label: 'Values & Missing' },
          { id: 'text', label: 'Text & Numbers' },
          { id: 'history', label: `Audit Log (${history.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#B98220] text-[#20242C] font-semibold'
                : 'border-transparent text-[#667085] hover:text-[#20242C] hover:border-[#E3E6EB]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Rows */}
      {activeTab === 'rows' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Deduplicate */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-[#667085]" />
              <h3 className="text-xs font-semibold text-[#20242C]">Deduplicate Rows</h3>
            </div>
            <p className="text-xs text-[#667085]">
              Identify and remove identical duplicate records, retaining the first occurrence.
            </p>
            <button
              onClick={() => handleApply(removeDuplicateRows(cleanedData, cleanedColumns))}
              className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
            >
              Remove duplicate rows
            </button>
          </div>

          {/* Remove Empty Rows */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-[#667085]" />
              <h3 className="text-xs font-semibold text-[#20242C]">Remove Empty Rows</h3>
            </div>
            <p className="text-xs text-[#667085]">
              Remove rows where all fields are null, blank, or whitespace.
            </p>
            <button
              onClick={() => handleApply(removeEmptyRows(cleanedData, cleanedColumns))}
              className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
            >
              Remove blank rows
            </button>
          </div>

          {/* Remove Empty Columns */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-[#667085]" />
              <h3 className="text-xs font-semibold text-[#20242C]">Prune Empty Columns</h3>
            </div>
            <p className="text-xs text-[#667085]">
              Remove columns that contain exclusively missing or null values.
            </p>
            <button
              onClick={() => handleApply(removeEmptyColumns(cleanedData, cleanedColumns))}
              className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
            >
              Remove empty columns
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Columns & Headers */}
      {activeTab === 'columns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Rename Column */}
            <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2.5">
              <h3 className="text-xs font-semibold text-[#20242C]">Rename Column</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-medium text-[#89919F] block mb-1">Target column</label>
                  <select
                    value={effectiveRenameCol}
                    onChange={(e) => setRenameOldCol(e.target.value)}
                    className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
                  >
                    {cleanedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#89919F] block mb-1">New column name</label>
                  <input
                    type="text"
                    placeholder="Enter new name..."
                    value={renameNewCol}
                    onChange={(e) => setRenameNewCol(e.target.value)}
                    className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] placeholder-[#89919F] focus:border-[#B98220] focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (renameNewCol.trim() && effectiveRenameCol) {
                      handleApply(renameColumn(cleanedData, cleanedColumns, effectiveRenameCol, renameNewCol.trim()));
                      setRenameNewCol('');
                    }
                  }}
                  disabled={!renameNewCol.trim()}
                  className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
                >
                  Rename column
                </button>
              </div>
            </div>

            {/* Normalize Header Case */}
            <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2.5">
              <h3 className="text-xs font-semibold text-[#20242C]">Normalize Header Case</h3>
              <p className="text-xs text-[#667085]">
                Standardize all column headers into consistent programmatic notation.
              </p>
              <div>
                <label className="text-[11px] font-medium text-[#89919F] block mb-1">Naming style</label>
                <select
                  value={headerStyle}
                  onChange={(e) => setHeaderStyle(e.target.value)}
                  className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
                >
                  <option value="snake_case">snake_case (e.g. order_total)</option>
                  <option value="camelCase">camelCase (e.g. orderTotal)</option>
                  <option value="PascalCase">PascalCase (e.g. OrderTotal)</option>
                  <option value="kebab-case">kebab-case (e.g. order-total)</option>
                  <option value="UPPERCASE">UPPERCASE (e.g. ORDER_TOTAL)</option>
                  <option value="Title Case">Title Case (e.g. Order Total)</option>
                </select>
              </div>
              <button
                onClick={() => handleApply(normalizeHeaders(cleanedData, cleanedColumns, headerStyle))}
                className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
              >
                Normalize all headers
              </button>
            </div>
          </div>

          {/* Column Ordering & Selective Dropping */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#20242C]">Reorder or Drop Columns</h3>
                <p className="text-xs text-[#667085]">
                  Select columns to drop, or use shift buttons to arrange order.
                </p>
              </div>
              {colsToDrop.length > 0 && (
                <button
                  onClick={executeDropColumns}
                  className="inline-flex h-7 items-center gap-1 rounded bg-red-600 px-2.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Drop selected ({colsToDrop.length})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {cleanedColumns.map((col, idx) => {
                const isSelectedForDrop = colsToDrop.includes(col);
                return (
                  <div
                    key={col}
                    className={`flex items-center justify-between rounded border p-2 text-xs transition-colors ${
                      isSelectedForDrop
                        ? 'border-red-300 bg-red-50 text-red-900'
                        : 'border-[#E3E6EB] bg-[#FFFFFF] text-[#20242C]'
                    }`}
                  >
                    <label className="flex items-center gap-2 truncate cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelectedForDrop}
                        onChange={() => handleDropColumnToggle(col)}
                        className="rounded border-[#E3E6EB] text-red-600 focus:ring-0"
                      />
                      <span className="truncate font-mono text-[11px]">{col}</span>
                    </label>

                    <div className="flex items-center gap-0.5 ml-1 shrink-0">
                      <button
                        onClick={() => executeMoveColumn(col, 'left')}
                        disabled={idx === 0}
                        className="rounded p-0.5 text-[#89919F] hover:text-[#20242C] disabled:opacity-20"
                        title="Move left"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => executeMoveColumn(col, 'right')}
                        disabled={idx === cleanedColumns.length - 1}
                        className="rounded p-0.5 text-[#89919F] hover:text-[#20242C] disabled:opacity-20"
                        title="Move right"
                      >
                        →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Values & Missing */}
      {activeTab === 'values' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Fill Missing Values */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2.5">
            <h3 className="text-xs font-semibold text-[#20242C]">Fill Missing Values (Imputation)</h3>
            <p className="text-xs text-[#667085]">
              Replace null or blank cells in a specific column using statistical or custom values.
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-medium text-[#89919F] block mb-1">Target column</label>
                <select
                  value={effectiveFillCol}
                  onChange={(e) => setFillCol(e.target.value)}
                  className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
                >
                  {cleanedColumns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#89919F] block mb-1">Imputation strategy</label>
                <select
                  value={fillStrategy}
                  onChange={(e) => setFillStrategy(e.target.value)}
                  className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
                >
                  <option value="custom">Custom value</option>
                  <option value="mean">Mean (Numeric)</option>
                  <option value="median">Median (Numeric)</option>
                  <option value="mode">Mode (Most frequent)</option>
                  <option value="zero">Zero (0)</option>
                </select>
              </div>

              {fillStrategy === 'custom' && (
                <div>
                  <label className="text-[11px] font-medium text-[#89919F] block mb-1">Replacement value</label>
                  <input
                    type="text"
                    placeholder="Value to fill..."
                    value={customFillValue}
                    onChange={(e) => setCustomFillValue(e.target.value)}
                    className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] placeholder-[#89919F] focus:border-[#B98220] focus:outline-none"
                  />
                </div>
              )}

              <button
                onClick={() => {
                  if (effectiveFillCol) {
                    handleApply(fillMissingValues(cleanedData, cleanedColumns, effectiveFillCol, fillStrategy, customFillValue));
                  }
                }}
                className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
              >
                Impute missing values
              </button>
            </div>
          </div>

          {/* Find & Replace */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2.5">
            <h3 className="text-xs font-semibold text-[#20242C]">Find & Replace</h3>
            <p className="text-xs text-[#667085]">
              Subsitute occurrences across one column or all columns.
            </p>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-[#89919F] block mb-1">In column</label>
                  <select
                    value={effectiveFindCol}
                    onChange={(e) => setFindCol(e.target.value)}
                    className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
                  >
                    <option value="all">All columns</option>
                    {cleanedColumns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#89919F] block mb-1">Match mode</label>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value)}
                    className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
                  >
                    <option value="exact">Exact match</option>
                    <option value="contains">Contains substring</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-[#89919F] block mb-1">Find</label>
                  <input
                    type="text"
                    placeholder="Find pattern..."
                    value={findValue}
                    onChange={(e) => setFindValue(e.target.value)}
                    className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] placeholder-[#89919F] focus:border-[#B98220] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#89919F] block mb-1">Replace with</label>
                  <input
                    type="text"
                    placeholder="Replacement..."
                    value={replaceValue}
                    onChange={(e) => setReplaceValue(e.target.value)}
                    className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] placeholder-[#89919F] focus:border-[#B98220] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (findValue !== '') {
                    handleApply(findAndReplace(cleanedData, cleanedColumns, findValue, replaceValue, effectiveFindCol, matchType));
                  }
                }}
                disabled={findValue === ''}
                className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] disabled:opacity-40 transition-colors"
              >
                Execute replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Text & Numbers */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Trim Whitespace */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-[#667085]" />
              <h3 className="text-xs font-semibold text-[#20242C]">Trim Whitespace</h3>
            </div>
            <p className="text-xs text-[#667085]">
              Strip leading and trailing spaces from all string values in every column.
            </p>
            <button
              onClick={() => handleApply(trimWhitespace(cleanedData, cleanedColumns))}
              className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
            >
              Trim all whitespace
            </button>
          </div>

          {/* Change Text Case */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <CaseSensitive className="h-4 w-4 text-[#667085]" />
              <h3 className="text-xs font-semibold text-[#20242C]">Text Case Normalization</h3>
            </div>
            <div className="space-y-1.5">
              <select
                value={effectiveCaseCol}
                onChange={(e) => setCaseCol(e.target.value)}
                className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
              >
                <option value="all">All text columns</option>
                {cleanedColumns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
              >
                <option value="lowercase">lowercase</option>
                <option value="UPPERCASE">UPPERCASE</option>
                <option value="Title Case">Title Case</option>
              </select>
            </div>
            <button
              onClick={() => handleApply(changeTextCase(cleanedData, cleanedColumns, effectiveCaseCol, caseType))}
              className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
            >
              Apply case format
            </button>
          </div>

          {/* Clean Currency & Numbers */}
          <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-[#667085]" />
              <h3 className="text-xs font-semibold text-[#20242C]">Clean Currency / Numbers</h3>
            </div>
            <p className="text-xs text-[#667085]">
              Normalize formatted financial strings ($1,299.99, ($450.50), 25%) into clean decimals.
            </p>
            <div>
              <select
                value={effectiveNumericCol}
                onChange={(e) => setNumericCol(e.target.value)}
                className="h-8 w-full rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
              >
                {cleanedColumns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() =>
                effectiveNumericCol &&
                handleApply(normalizeNumericStrings(cleanedData, cleanedColumns, effectiveNumericCol))
              }
              className="w-full h-8 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
            >
              Clean numbers
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'history' && (
        <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#20242C] flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-[#667085]" />
              Transformation Audit Log
            </h3>
            {history.length > 0 && (
              <span className="text-[11px] text-[#89919F]">
                Reverse chronological order
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-[#89919F] py-6 text-center">
              No cleaning transformations have been applied yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {[...history].reverse().map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded border border-[#E3E6EB] bg-[#F7F8FA] px-3 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#FFFFFF] border border-[#E3E6EB] px-1.5 py-0.2 font-mono text-[10px] text-[#667085] font-medium">
                      #{history.length - idx}
                    </span>
                    <div>
                      <span className="font-semibold text-[#20242C]">{step.action}: </span>
                      <span className="text-[#667085]">{step.description}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-[#89919F] font-mono">
                    {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cleaned Dataset Preview Table */}
      <div className="rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#667085]" />
            <h3 className="text-xs font-semibold text-[#20242C]">Cleaned Data Preview</h3>
          </div>
          <span className="text-[11px] text-[#89919F]">
            First 10 of {cleanedData.length.toLocaleString()} rows
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-[#E3E6EB] max-h-56">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-[#F7F8FA] text-[#667085] sticky top-0 border-b border-[#E3E6EB]">
              <tr>
                <th className="px-2.5 py-1.5 border-r border-[#E3E6EB] text-center w-8 text-[#89919F]">#</th>
                {cleanedColumns.map((col) => (
                  <th key={col} className="px-2.5 py-1.5 font-mono border-r border-[#E3E6EB] last:border-r-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EB] text-[#20242C]">
              {cleanedData.slice(0, 10).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#F7F8FA]/60">
                  <td className="px-2.5 py-1 text-center text-[#89919F] border-r border-[#E3E6EB] font-mono">
                    {rIdx + 1}
                  </td>
                  {cleanedColumns.map((col) => {
                    const val = row[col];
                    const isEmpty = val === null || val === undefined || val === '';
                    return (
                      <td key={col} className="px-2.5 py-1 border-r border-[#E3E6EB] last:border-r-0 font-mono truncate max-w-[180px]">
                        {isEmpty ? <span className="text-[#89919F]/60 select-none">—</span> : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
