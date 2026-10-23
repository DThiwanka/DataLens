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
  Search,
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
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Cleaning Studio
            </h2>
            <p className="text-xs text-gray-500">
              Transform, clean, and standardize the dataset with reversible operations.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onUndoTransformation}
              disabled={history.length === 0}
              className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="Undo last step"
            >
              <Undo2 className="h-3.5 w-3.5 text-gray-500" />
              <span>Undo</span>
            </button>

            <button
              onClick={handleResetClick}
              disabled={history.length === 0}
              className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="Reset all changes"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => exportToCsv(cleanedData, cleanedColumns, 'datalens-cleaned-data.csv')}
              className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-gray-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onCommitCleanedToActive}
              className="inline-flex items-center gap-1 rounded bg-[#C58A16] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#B45309] transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply to explorer</span>
            </button>
          </div>
        </div>

        {/* Diff summary stats */}
        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-gray-100 pt-3 text-xs">
          <div className="rounded bg-gray-50 p-2 border border-gray-200">
            <span className="text-[10px] text-gray-500 block">Row Count</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-gray-900">{cleanedData.length.toLocaleString()}</span>
              {rowsDiff !== 0 && (
                <span className={`text-[11px] font-mono font-medium ${rowsDiff < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ({rowsDiff > 0 ? `+${rowsDiff}` : rowsDiff})
                </span>
              )}
            </div>
          </div>

          <div className="rounded bg-gray-50 p-2 border border-gray-200">
            <span className="text-[10px] text-gray-500 block">Column Count</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-gray-900">{cleanedColumns.length}</span>
              {colsDiff !== 0 && (
                <span className={`text-[11px] font-mono font-medium ${colsDiff < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  ({colsDiff > 0 ? `+${colsDiff}` : colsDiff})
                </span>
              )}
            </div>
          </div>

          <div className="rounded bg-gray-50 p-2 border border-gray-200">
            <span className="text-[10px] text-gray-500 block">Raw Backup</span>
            <span className="font-medium text-emerald-700">Preserved intact</span>
          </div>

          <div className="rounded bg-gray-50 p-2 border border-gray-200">
            <span className="text-[10px] text-gray-500 block">Applied Steps</span>
            <span className="font-semibold text-gray-900">{history.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1 text-xs overflow-x-auto">
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
                ? 'border-amber-600 text-gray-900 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
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
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Deduplicate Rows</h3>
            </div>
            <p className="text-xs text-gray-500">
              Identify and remove identical duplicate records, retaining the first occurrence.
            </p>
            <button
              onClick={() => handleApply(removeDuplicateRows(cleanedData, cleanedColumns))}
              className="mt-2 w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Remove duplicates
            </button>
          </div>

          {/* Remove Empty Rows */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Remove Empty Rows</h3>
            </div>
            <p className="text-xs text-gray-500">
              Discard rows where every single cell is null or empty.
            </p>
            <button
              onClick={() => handleApply(removeEmptyRows(cleanedData, cleanedColumns))}
              className="mt-2 w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Remove blank rows
            </button>
          </div>

          {/* Remove Empty Columns */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Remove Empty Columns</h3>
            </div>
            <p className="text-xs text-gray-500">
              Discard columns that contain zero non-empty values across all rows.
            </p>
            <button
              onClick={() => handleApply(removeEmptyColumns(cleanedData, cleanedColumns))}
              className="mt-2 w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Drop blank columns
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Columns & Headers */}
      {activeTab === 'columns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Header Normalization */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Normalize Column Headers</h3>
            </div>
            <p className="text-xs text-gray-500">
              Convert all column names into standard programmatic casing.
            </p>
            <select
              value={headerStyle}
              onChange={(e) => setHeaderStyle(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
            >
              <option value="snake_case">snake_case (e.g. order_date)</option>
              <option value="camelCase">camelCase (e.g. orderDate)</option>
              <option value="UPPERCASE">UPPERCASE (e.g. ORDER_DATE)</option>
              <option value="Title Case">Title Case (e.g. Order Date)</option>
            </select>
            <button
              onClick={() => handleApply(normalizeHeaders(cleanedData, cleanedColumns, headerStyle))}
              className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Normalize headers
            </button>
          </div>

          {/* Rename Column */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Rename Column</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={effectiveRenameCol}
                onChange={(e) => setRenameOldCol(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
              >
                {cleanedColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="New name..."
                value={renameNewCol}
                onChange={(e) => setRenameNewCol(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (effectiveRenameCol && renameNewCol) {
                  handleApply(renameColumn(cleanedData, cleanedColumns, effectiveRenameCol, renameNewCol));
                  setRenameNewCol('');
                }
              }}
              disabled={!renameNewCol.trim()}
              className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Rename
            </button>
          </div>

          {/* Reorder and Drop Columns */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-500" />
                  Reorder or Drop Columns
                </h3>
                <p className="text-xs text-gray-500">
                  Select columns to remove, or shift positions horizontally.
                </p>
              </div>
              {colsToDrop.length > 0 && (
                <button
                  onClick={executeDropColumns}
                  className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Drop selected ({colsToDrop.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {cleanedColumns.map((col, idx) => {
                const isSelectedToDrop = colsToDrop.includes(col);
                return (
                  <div
                    key={col}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${
                      isSelectedToDrop
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelectedToDrop}
                      onChange={() => handleDropColumnToggle(col)}
                      className="rounded border-gray-300 text-red-600 focus:ring-0"
                    />
                    <span className="font-mono text-xs">{col}</span>

                    <div className="flex items-center gap-0.5 ml-1 border-l border-gray-200 pl-1">
                      <button
                        onClick={() => executeMoveColumn(col, 'left')}
                        disabled={idx === 0}
                        className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                        title="Move left"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => executeMoveColumn(col, 'right')}
                        disabled={idx === cleanedColumns.length - 1}
                        className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
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
          {/* Find & Replace */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Find & Replace</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={effectiveFindCol}
                onChange={(e) => setFindCol(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
              >
                <option value="all">All columns</option>
                {cleanedColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
              >
                <option value="exact">Exact match</option>
                <option value="contains">Substring</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Find value..."
                value={findValue}
                onChange={(e) => setFindValue(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceValue}
                onChange={(e) => setReplaceValue(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (findValue !== '') {
                  handleApply(
                    findAndReplace(cleanedData, cleanedColumns, {
                      column: effectiveFindCol,
                      findValue,
                      replaceValue,
                      matchType,
                    })
                  );
                }
              }}
              disabled={findValue === ''}
              className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Replace values
            </button>
          </div>

          {/* Fill Missing Values */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Fill Missing Values</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={effectiveFillCol}
                onChange={(e) => setFillCol(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
              >
                {cleanedColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={fillStrategy}
                onChange={(e) => setFillStrategy(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
              >
                <option value="custom">Custom value</option>
                <option value="zero">Fill zero (0)</option>
                <option value="unknown">Fill &quot;Unknown&quot;</option>
                <option value="mean">Column mean (numeric)</option>
                <option value="median">Column median (numeric)</option>
              </select>
            </div>

            {fillStrategy === 'custom' && (
              <input
                type="text"
                placeholder="Custom replacement value..."
                value={customFillValue}
                onChange={(e) => setCustomFillValue(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-600 focus:outline-none"
              />
            )}

            <button
              onClick={() => {
                handleApply(
                  fillMissingValues(cleanedData, cleanedColumns, {
                    column: effectiveFillCol,
                    strategy: fillStrategy,
                    customValue: customFillValue,
                  })
                );
              }}
              className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fill missing values
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Text & Numbers */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Trim Whitespace */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Trim Whitespace</h3>
            </div>
            <p className="text-xs text-gray-500">
              Remove leading and trailing spaces from all text cells across the dataset.
            </p>
            <button
              onClick={() => handleApply(trimWhitespace(cleanedData, cleanedColumns, 'all'))}
              className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Trim all text cells
            </button>
          </div>

          {/* Change Text Case */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <CaseSensitive className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Change Text Case</h3>
            </div>
            <div className="space-y-1.5">
              <select
                value={effectiveCaseCol}
                onChange={(e) => setCaseCol(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
              >
                <option value="all">All text columns</option>
                {cleanedColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
              >
                <option value="lowercase">lowercase</option>
                <option value="UPPERCASE">UPPERCASE</option>
                <option value="Title Case">Title Case</option>
              </select>
            </div>
            <button
              onClick={() =>
                handleApply(
                  changeTextCase(cleanedData, cleanedColumns, {
                    column: effectiveCaseCol,
                    casing: caseType,
                  })
                )
              }
              className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Apply casing
            </button>
          </div>

          {/* Normalize Numeric Strings */}
          <div className="rounded-md border border-gray-200 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900">Clean Numbers</h3>
            </div>
            <p className="text-xs text-gray-500">
              Strip currency symbols ($, €, £), commas, and percent signs from numeric text.
            </p>
            <select
              value={effectiveNumericCol}
              onChange={(e) => setNumericCol(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
            >
              {cleanedColumns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                handleApply(
                  normalizeNumericStrings(cleanedData, cleanedColumns, {
                    column: effectiveNumericCol,
                  })
                )
              }
              className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clean numbers
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'history' && (
        <div className="rounded-md border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
              <History className="h-4 w-4 text-gray-500" />
              Transformation History
            </h3>
            {history.length > 0 && (
              <span className="text-[11px] text-gray-400">
                Most recent operation at top
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No cleaning transformations have been applied yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {[...history].reverse().map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white border border-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-600 font-medium">
                      #{history.length - idx}
                    </span>
                    <div>
                      <span className="font-medium text-gray-900">{step.action}: </span>
                      <span className="text-gray-500">{step.description}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 font-mono">
                    {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cleaned Dataset Preview Table */}
      <div className="rounded-md border border-gray-200 bg-white p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-gray-500" />
            <h3 className="text-xs font-semibold text-gray-900">Cleaned Data Preview</h3>
          </div>
          <span className="text-[11px] text-gray-500">
            First 10 of {cleanedData.length.toLocaleString()} rows
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-gray-200 max-h-60">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 border-b border-gray-200">
              <tr>
                <th className="px-2.5 py-1.5 border-r border-gray-200 text-center w-8">#</th>
                {cleanedColumns.map((col) => (
                  <th key={col} className="px-2.5 py-1.5 font-mono border-r border-gray-200 last:border-r-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {cleanedData.slice(0, 10).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-gray-50/50">
                  <td className="px-2.5 py-1 text-center text-gray-400 border-r border-gray-100 font-mono">
                    {rIdx + 1}
                  </td>
                  {cleanedColumns.map((col) => {
                    const val = row[col];
                    const isEmpty = val === null || val === undefined || val === '';
                    return (
                      <td key={col} className="px-2.5 py-1 border-r border-gray-100 last:border-r-0 font-mono truncate max-w-[180px]">
                        {isEmpty ? <span className="text-gray-300 italic text-[11px]">null</span> : String(val)}
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
