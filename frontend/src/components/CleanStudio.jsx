import { useState } from 'react';
import {
  Wand2,
  Trash2,
  Undo2,
  RotateCcw,
  CheckCircle2,
  Download,
  CaseSensitive,
  AlignLeft,
  Columns,
  Search,
  Sparkles,
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
} from '../services/dataCleaner';
import { exportToCsv } from '../services/csvExporter';

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
  // Active Operation Tab
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

  // Quick stats comparison
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
    const res = dropColumns(cleanedData, cleanedColumns, colsToDrop);
    handleApply(res);
    setColsToDrop([]);
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
    <div className="space-y-6">
      {/* Top Banner: Inspection & Transformation Summary */}
      <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Data Cleaning Studio
                {history.length > 0 && (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs text-amber-400 font-normal">
                    {history.length} transformation{history.length === 1 ? '' : 's'} applied
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Execute client-side data sanitation, structural adjustments, and corrections.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onUndoTransformation}
              disabled={history.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo latest change"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Undo Step</span>
            </button>

            <button
              onClick={onResetToOriginal}
              disabled={history.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition-all hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Reset all changes back to original file"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Original</span>
            </button>

            <button
              onClick={onCommitCleanedToActive}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-500/25"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Apply to Active Explorer</span>
            </button>

            <button
              onClick={() => exportToCsv(cleanedData, cleanedColumns, 'datalens-cleaned-data.csv')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 transition-all hover:bg-amber-500/20"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Clean CSV</span>
            </button>
          </div>
        </div>

        {/* Metrics Diff Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/5 pt-4 text-xs">
          <div className="rounded-lg bg-[#0B0E13] p-3 border border-white/5">
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Row Count</span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-base font-bold text-white">{cleanedData.length.toLocaleString()}</span>
              {rowsDiff !== 0 && (
                <span className={`text-[11px] font-mono ${rowsDiff < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {rowsDiff > 0 ? `+${rowsDiff}` : rowsDiff}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500">Original: {originalData.length.toLocaleString()}</span>
          </div>

          <div className="rounded-lg bg-[#0B0E13] p-3 border border-white/5">
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Column Count</span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-base font-bold text-white">{cleanedColumns.length}</span>
              {colsDiff !== 0 && (
                <span className={`text-[11px] font-mono ${colsDiff < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {colsDiff > 0 ? `+${colsDiff}` : colsDiff}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500">Original: {originalColumns.length}</span>
          </div>

          <div className="rounded-lg bg-[#0B0E13] p-3 border border-white/5">
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Integrity Status</span>
            <div className="mt-0.5 flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Immutable Origin Preserved</span>
            </div>
            <span className="text-[10px] text-slate-500">Zero destructive edits to raw input</span>
          </div>

          <div className="rounded-lg bg-[#0B0E13] p-3 border border-white/5">
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">History Depth</span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-base font-bold text-amber-400">{history.length}</span>
              <span className="text-[11px] text-slate-400">operations</span>
            </div>
            <span className="text-[10px] text-slate-500">Every step can be reversed</span>
          </div>
        </div>
      </div>

      {/* Operation Categories Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 gap-2 pb-1 text-xs scrollbar-none">
        {[
          { id: 'rows', label: '1. Row Sanitation', icon: Trash2 },
          { id: 'columns', label: '2. Columns & Headers', icon: Columns },
          { id: 'values', label: '3. Find, Replace & Missing', icon: Search },
          { id: 'text', label: '4. Text & Numbers', icon: CaseSensitive },
          { id: 'history', label: `5. Audit Log (${history.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5 font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-amber-500 bg-amber-500/10 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Row Sanitation */}
      {activeTab === 'rows' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Duplicate Rows */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-amber-400" />
              Deduplicate Rows
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scans all rows and drops exact duplicates, keeping the first occurrence.
            </p>
            <button
              onClick={() => handleApply(removeDuplicateRows(cleanedData, cleanedColumns))}
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              Remove Duplicate Rows
            </button>
          </div>

          {/* Remove Empty Rows */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-amber-400" />
              Remove Empty Rows
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Removes rows where every single cell contains only whitespace or null.
            </p>
            <button
              onClick={() => handleApply(removeEmptyRows(cleanedData, cleanedColumns))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-all"
            >
              Remove Blank Rows
            </button>
          </div>

          {/* Remove Empty Columns */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Columns className="h-4 w-4 text-amber-400" />
              Remove Empty Columns
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects and removes entire columns that do not have any non-empty cell.
            </p>
            <button
              onClick={() => handleApply(removeEmptyColumns(cleanedData, cleanedColumns))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-all"
            >
              Drop Blank Columns
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Columns & Headers */}
      {activeTab === 'columns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Header Normalization */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-amber-400" />
              Normalize Column Headers
            </h3>
            <p className="text-xs text-slate-400">
              Standardize all header names to clean programmatic conventions.
            </p>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-400 uppercase">Target Format</label>
              <select
                value={headerStyle}
                onChange={(e) => setHeaderStyle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="snake_case">snake_case (e.g. order_date)</option>
                <option value="camelCase">camelCase (e.g. orderDate)</option>
                <option value="UPPERCASE">UPPERCASE (e.g. ORDER_DATE)</option>
                <option value="Title Case">Title Case (e.g. Order Date)</option>
              </select>
            </div>
            <button
              onClick={() => handleApply(normalizeHeaders(cleanedData, cleanedColumns, headerStyle))}
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              Apply Header Normalization
            </button>
          </div>

          {/* Rename Column */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Columns className="h-4 w-4 text-amber-400" />
              Rename Specific Column
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Current Column</label>
                <select
                  value={renameOldCol}
                  onChange={(e) => setRenameOldCol(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {cleanedColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">New Name</label>
                <input
                  type="text"
                  placeholder="e.g. customer_email"
                  value={renameNewCol}
                  onChange={(e) => setRenameNewCol(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (renameOldCol && renameNewCol) {
                  handleApply(renameColumn(cleanedData, cleanedColumns, renameOldCol, renameNewCol));
                  setRenameNewCol('');
                }
              }}
              disabled={!renameNewCol.trim()}
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 transition-all"
            >
              Rename Column
            </button>
          </div>

          {/* Reorder and Drop Columns Panel */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-amber-400" />
                  Reorder or Drop Selected Columns
                </h3>
                <p className="text-xs text-slate-400">
                  Select columns to drop, or use the arrows to move column positions.
                </p>
              </div>

              {colsToDrop.length > 0 && (
                <button
                  onClick={executeDropColumns}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                >
                  Drop Selected ({colsToDrop.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {cleanedColumns.map((col, idx) => {
                const isSelectedToDrop = colsToDrop.includes(col);
                return (
                  <div
                    key={col}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${
                      isSelectedToDrop
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                        : 'border-white/10 bg-[#0B0E13] text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelectedToDrop}
                      onChange={() => handleDropColumnToggle(col)}
                      className="rounded border-white/10 bg-[#141820] text-rose-500 focus:ring-0"
                    />
                    <span className="font-mono text-xs">{col}</span>

                    <div className="flex items-center gap-0.5 ml-2 border-l border-white/10 pl-1.5">
                      <button
                        onClick={() => executeMoveColumn(col, 'left')}
                        disabled={idx === 0}
                        className="px-1 text-slate-400 hover:text-white disabled:opacity-20"
                        title="Move column left"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => executeMoveColumn(col, 'right')}
                        disabled={idx === cleanedColumns.length - 1}
                        className="px-1 text-slate-400 hover:text-white disabled:opacity-20"
                        title="Move column right"
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

      {/* Tab 3: Find, Replace & Missing Values */}
      {activeTab === 'values' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Find & Replace */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-amber-400" />
              Find & Replace
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">In Column</label>
                <select
                  value={findCol}
                  onChange={(e) => setFindCol(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Columns</option>
                  {cleanedColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Match Type</label>
                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="exact">Exact Cell Match</option>
                  <option value="contains">Contains Substring</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Find Text</label>
                <input
                  type="text"
                  placeholder="e.g. N/A"
                  value={findValue}
                  onChange={(e) => setFindValue(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Replace With</label>
                <input
                  type="text"
                  placeholder="e.g. Unknown"
                  value={replaceValue}
                  onChange={(e) => setReplaceValue(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (findValue !== '') {
                  handleApply(
                    findAndReplace(cleanedData, cleanedColumns, {
                      column: findCol,
                      findValue,
                      replaceValue,
                      matchType,
                    })
                  );
                }
              }}
              disabled={findValue === ''}
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 transition-all"
            >
              Replace Values
            </button>
          </div>

          {/* Fill Missing Values */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Impute / Fill Missing Values
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Target Column</label>
                <select
                  value={fillCol}
                  onChange={(e) => setFillCol(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {cleanedColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Strategy</label>
                <select
                  value={fillStrategy}
                  onChange={(e) => setFillStrategy(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="custom">Custom String Value</option>
                  <option value="zero">Fill with Zero (0)</option>
                  <option value="unknown">Fill with &quot;Unknown&quot;</option>
                  <option value="mean">Column Mean (Numeric)</option>
                  <option value="median">Column Median (Numeric)</option>
                </select>
              </div>
            </div>

            {fillStrategy === 'custom' && (
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Custom Replacement</label>
                <input
                  type="text"
                  placeholder="e.g. Not Provided"
                  value={customFillValue}
                  onChange={(e) => setCustomFillValue(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}

            <button
              onClick={() => {
                handleApply(
                  fillMissingValues(cleanedData, cleanedColumns, {
                    column: fillCol,
                    strategy: fillStrategy,
                    customValue: customFillValue,
                  })
                );
              }}
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              Fill Missing Cells
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Text & Numbers */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Trim Whitespace */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-amber-400" />
              Trim Whitespace
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strips leading and trailing spaces from all text cells across the entire dataset.
            </p>
            <button
              onClick={() => handleApply(trimWhitespace(cleanedData, cleanedColumns, 'all'))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-all"
            >
              Trim All Text Cells
            </button>
          </div>

          {/* Change Text Case */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CaseSensitive className="h-4 w-4 text-amber-400" />
              Convert Text Case
            </h3>
            <div className="space-y-2">
              <select
                value={caseCol}
                onChange={(e) => setCaseCol(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Text Columns</option>
                {cleanedColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
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
                    column: caseCol,
                    casing: caseType,
                  })
                )
              }
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              Apply Casing
            </button>
          </div>

          {/* Normalize Numeric Strings */}
          <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Clean Numeric Strings
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explicitly strips currency symbols ($, €, £), commas, and % from numeric text columns.
            </p>
            <select
              value={numericCol}
              onChange={(e) => setNumericCol(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0E13] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
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
                    column: numericCol,
                  })
                )
              }
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              Clean & Coerce Numbers
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Transformation History Audit Log */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-amber-400" />
              Transformation Stack & Audit Log
            </h3>
            {history.length > 0 && (
              <span className="text-xs text-slate-400">
                Most recent operation is at the top
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No cleaning transformations have been applied yet. Apply operations above to start sanitizing your data.
            </p>
          ) : (
            <div className="space-y-2">
              {[...history].reverse().map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0B0E13] p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 font-mono text-[10px] text-amber-400 font-semibold">
                      #{history.length - idx}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{step.action}</p>
                      <p className="text-slate-400 text-[11px]">{step.description}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Preview Table of Cleaned Data */}
      <div className="rounded-xl border border-white/8 bg-[#141820]/90 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Cleaned Dataset Live Preview</span>
          </div>
          <span className="text-xs text-slate-400">
            Showing first 10 rows of {cleanedData.length.toLocaleString()} cleaned rows
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/5 max-h-72 scrollbar-thin">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-[#161c26] text-slate-400 sticky top-0">
              <tr>
                <th className="px-3 py-2 border-r border-white/5 text-center">#</th>
                {cleanedColumns.map((col) => (
                  <th key={col} className="px-3 py-2 font-mono border-r border-white/5 last:border-r-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {cleanedData.slice(0, 10).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-center text-slate-500 border-r border-white/5 font-mono">
                    {rIdx + 1}
                  </td>
                  {cleanedColumns.map((col) => {
                    const val = row[col];
                    const isEmpty = val === null || val === undefined || val === '';
                    return (
                      <td key={col} className="px-3 py-2 border-r border-white/5 last:border-r-0 font-mono truncate max-w-[200px]">
                        {isEmpty ? <span className="text-slate-600 italic">null</span> : String(val)}
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
