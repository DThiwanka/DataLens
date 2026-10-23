/**
 * DataLens AI - Data Cleaning Engine
 * Fully client-side, immutable transformation functions for tabular data.
 * Every operation returns a fresh dataset, fresh columns, and an audit metadata entry.
 */

import { isNullOrEmpty, isNumeric } from '../utils/dataTypes.js';

/**
 * Normalizes header string according to selected convention.
 */
export function normalizeHeaderString(str, style = 'snake_case') {
  if (!str) return 'column';
  const clean = str
    .replace(/[^\w\s-]/g, '')
    .trim();

  switch (style) {
    case 'snake_case':
      return clean.toLowerCase().replace(/[\s-]+/g, '_');
    case 'camelCase':
      return clean
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    case 'UPPERCASE':
      return clean.toUpperCase().replace(/[\s-]+/g, '_');
    case 'lowercase':
      return clean.toLowerCase().replace(/[\s-]+/g, ' ');
    case 'Title Case':
      return clean
        .toLowerCase()
        .split(/[\s_-]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    default:
      return clean;
  }
}

/**
 * 1. Remove duplicate rows based on all or specified columns.
 */
export function removeDuplicateRows(data, columns, subsetCols = null) {
  const targetCols = subsetCols && subsetCols.length > 0 ? subsetCols : columns;
  const seen = new Set();
  const cleanedData = [];
  let removedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    // Deterministic row signature preventing separator collision
    const key = JSON.stringify(targetCols.map((c) => row[c] ?? ''));
    if (!seen.has(key)) {
      seen.add(key);
      cleanedData.push({ ...row });
    } else {
      removedCount++;
    }
  }

  return {
    data: cleanedData,
    columns: [...columns],
    action: 'Remove Duplicates',
    description: `Removed ${removedCount} duplicate row${removedCount === 1 ? '' : 's'}.`,
    affectedRows: removedCount,
    affectedCols: 0,
  };
}

/**
 * 2. Remove rows where every cell is empty.
 */
export function removeEmptyRows(data, columns) {
  let removedCount = 0;
  const cleanedData = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const isRowEmpty = columns.every((col) => isNullOrEmpty(row[col]));
    if (isRowEmpty) {
      removedCount++;
    } else {
      cleanedData.push({ ...row });
    }
  }

  return {
    data: cleanedData,
    columns: [...columns],
    action: 'Remove Empty Rows',
    description: `Removed ${removedCount} completely empty row${removedCount === 1 ? '' : 's'}.`,
    affectedRows: removedCount,
    affectedCols: 0,
  };
}

/**
 * 3. Remove columns where every cell is empty.
 */
export function removeEmptyColumns(data, columns) {
  const emptyCols = [];

  columns.forEach((col) => {
    const isAllEmpty = data.every((row) => isNullOrEmpty(row[col]));
    if (isAllEmpty) {
      emptyCols.push(col);
    }
  });

  if (emptyCols.length === 0) {
    return {
      data,
      columns,
      action: 'Remove Empty Columns',
      description: 'No completely empty columns were found.',
      affectedRows: 0,
      affectedCols: 0,
    };
  }

  const remainingColumns = columns.filter((c) => !emptyCols.includes(c));
  const cleanedData = data.map((row) => {
    const newRow = { ...row };
    emptyCols.forEach((col) => delete newRow[col]);
    return newRow;
  });

  return {
    data: cleanedData,
    columns: remainingColumns,
    action: 'Remove Empty Columns',
    description: `Removed ${emptyCols.length} empty column${emptyCols.length === 1 ? '' : 's'} (${emptyCols.join(', ')}).`,
    affectedRows: 0,
    affectedCols: emptyCols.length,
  };
}

/**
 * 4. Drop selected columns.
 */
export function dropColumns(data, columns, columnsToDrop = []) {
  if (!columnsToDrop || columnsToDrop.length === 0) {
    return { data, columns, action: 'Drop Columns', description: 'No columns selected to drop.', affectedRows: 0, affectedCols: 0 };
  }

  if (columnsToDrop.length >= columns.length) {
    return {
      data,
      columns,
      action: 'Drop Columns',
      description: 'Cannot drop all columns. At least one column must remain in the dataset.',
      affectedRows: 0,
      affectedCols: 0,
    };
  }

  const remainingColumns = columns.filter((c) => !columnsToDrop.includes(c));
  const cleanedData = data.map((row) => {
    const newRow = { ...row };
    columnsToDrop.forEach((col) => delete newRow[col]);
    return newRow;
  });

  return {
    data: cleanedData,
    columns: remainingColumns,
    action: 'Drop Columns',
    description: `Dropped ${columnsToDrop.length} column${columnsToDrop.length === 1 ? '' : 's'}: ${columnsToDrop.join(', ')}.`,
    affectedRows: 0,
    affectedCols: columnsToDrop.length,
  };
}

/**
 * 5. Reorder columns.
 */
export function reorderColumns(data, columns, newColumnOrder) {
  // Validate that newColumnOrder contains the same columns
  if (!newColumnOrder || newColumnOrder.length !== columns.length) {
    return { data, columns, action: 'Reorder Columns', description: 'Invalid column order specified.', affectedRows: 0, affectedCols: 0 };
  }

  return {
    data: data.map((row) => ({ ...row })),
    columns: [...newColumnOrder],
    action: 'Reorder Columns',
    description: `Reordered ${newColumnOrder.length} columns.`,
    affectedRows: 0,
    affectedCols: newColumnOrder.length,
  };
}

/**
 * 6. Rename a column.
 */
export function renameColumn(data, columns, oldName, newName) {
  const trimmedNew = (newName || '').trim();
  if (!trimmedNew || oldName === trimmedNew) {
    return { data, columns, action: 'Rename Column', description: 'No change to column name.', affectedRows: 0, affectedCols: 0 };
  }

  // Ensure unique new name
  let finalNewName = trimmedNew;
  let count = 2;
  while (columns.includes(finalNewName) && finalNewName !== oldName) {
    finalNewName = `${trimmedNew}_${count++}`;
  }

  const updatedColumns = columns.map((c) => (c === oldName ? finalNewName : c));
  const cleanedData = data.map((row) => {
    const newRow = {};
    columns.forEach((col) => {
      if (col === oldName) {
        newRow[finalNewName] = row[col];
      } else {
        newRow[col] = row[col];
      }
    });
    return newRow;
  });

  return {
    data: cleanedData,
    columns: updatedColumns,
    action: 'Rename Column',
    description: `Renamed column '${oldName}' to '${finalNewName}'.`,
    affectedRows: data.length,
    affectedCols: 1,
  };
}

/**
 * 7. Normalize all column headers (e.g. snake_case, camelCase).
 */
export function normalizeHeaders(data, columns, style = 'snake_case') {
  const nameMapping = {};
  const seen = new Set();
  const newColumns = [];

  columns.forEach((col) => {
    let norm = normalizeHeaderString(col, style);
    if (!norm) norm = 'col';
    let candidate = norm;
    let count = 2;
    while (seen.has(candidate)) {
      candidate = `${norm}_${count++}`;
    }
    seen.add(candidate);
    nameMapping[col] = candidate;
    newColumns.push(candidate);
  });

  const cleanedData = data.map((row) => {
    const newRow = {};
    columns.forEach((col) => {
      newRow[nameMapping[col]] = row[col];
    });
    return newRow;
  });

  return {
    data: cleanedData,
    columns: newColumns,
    action: 'Normalize Headers',
    description: `Normalized ${columns.length} column headers to ${style}.`,
    affectedRows: data.length,
    affectedCols: columns.length,
  };
}

/**
 * 8. Trim whitespace from text cells.
 */
export function trimWhitespace(data, columns, targetColumn = 'all') {
  let changedCells = 0;
  const colsToTrim = targetColumn === 'all' ? columns : [targetColumn];

  const cleanedData = data.map((row) => {
    const newRow = { ...row };
    colsToTrim.forEach((col) => {
      if (typeof newRow[col] === 'string') {
        const trimmed = newRow[col].trim();
        if (trimmed !== newRow[col]) {
          newRow[col] = trimmed;
          changedCells++;
        }
      }
    });
    return newRow;
  });

  return {
    data: cleanedData,
    columns: [...columns],
    action: 'Trim Whitespace',
    description: `Trimmed extra whitespace in ${changedCells} cell${changedCells === 1 ? '' : 's'}.`,
    affectedRows: changedCells,
    affectedCols: colsToTrim.length,
  };
}

/**
 * 9. Find and replace values.
 */
export function findAndReplace(data, columns, { column = 'all', findValue, replaceValue = '', matchType = 'exact' }) {
  if (findValue === undefined || findValue === null || findValue === '') {
    return { data, columns, action: 'Find & Replace', description: 'Find value cannot be empty.', affectedRows: 0, affectedCols: 0 };
  }

  const colsToProcess = column === 'all' ? columns : [column];
  let replacedCount = 0;
  const searchStr = String(findValue);
  const repStr = String(replaceValue);

  const cleanedData = data.map((row) => {
    const newRow = { ...row };
    colsToProcess.forEach((col) => {
      const cellVal = String(newRow[col] ?? '');
      if (matchType === 'exact') {
        if (cellVal.trim().toLowerCase() === searchStr.trim().toLowerCase()) {
          newRow[col] = repStr;
          replacedCount++;
        }
      } else {
        // Substring replace (case-insensitive)
        if (cellVal.toLowerCase().includes(searchStr.toLowerCase())) {
          const regex = new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          newRow[col] = cellVal.replace(regex, repStr);
          replacedCount++;
        }
      }
    });
    return newRow;
  });

  return {
    data: cleanedData,
    columns: [...columns],
    action: 'Find & Replace',
    description: `Replaced ${replacedCount} occurrence${replacedCount === 1 ? '' : 's'} of "${findValue}" with "${replaceValue}".`,
    affectedRows: replacedCount,
    affectedCols: colsToProcess.length,
  };
}

/**
 * 10. Replace missing/empty values with user value or calculated metric (mean/median).
 */
export function fillMissingValues(data, columns, { column, strategy = 'custom', customValue = '' }) {
  if (!column || !columns.includes(column)) {
    return { data, columns, action: 'Fill Missing Values', description: 'Invalid column specified.', affectedRows: 0, affectedCols: 0 };
  }

  let fillVal = customValue;

  if (strategy === 'zero') {
    fillVal = '0';
  } else if (strategy === 'unknown') {
    fillVal = 'Unknown';
  } else if (strategy === 'mean' || strategy === 'median') {
    // Calculate numeric mean or median
    const nums = data
      .map((r) => r[column])
      .filter((v) => !isNullOrEmpty(v) && isNumeric(v))
      .map(Number);

    if (nums.length > 0) {
      if (strategy === 'mean') {
        const sum = nums.reduce((acc, v) => acc + v, 0);
        fillVal = String(Math.round((sum / nums.length) * 100) / 100);
      } else {
        nums.sort((a, b) => a - b);
        const mid = Math.floor(nums.length / 2);
        const median = nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
        fillVal = String(median);
      }
    } else {
      fillVal = '0';
    }
  }

  let filledCount = 0;
  const cleanedData = data.map((row) => {
    const newRow = { ...row };
    if (isNullOrEmpty(newRow[column])) {
      newRow[column] = fillVal;
      filledCount++;
    }
    return newRow;
  });

  return {
    data: cleanedData,
    columns: [...columns],
    action: 'Fill Missing Values',
    description: `Filled ${filledCount} missing value${filledCount === 1 ? '' : 's'} in '${column}' with "${fillVal}".`,
    affectedRows: filledCount,
    affectedCols: 1,
  };
}

/**
 * 11. Change text casing (UPPERCASE, lowercase, Title Case).
 */
export function changeTextCase(data, columns, { column = 'all', casing = 'lowercase' }) {
  const colsToProcess = column === 'all' ? columns : [column];
  let updatedCells = 0;

  const cleanedData = data.map((row) => {
    const newRow = { ...row };
    colsToProcess.forEach((col) => {
      const val = newRow[col];
      if (typeof val === 'string' && val.trim() !== '') {
        let transformed = val;
        if (casing === 'UPPERCASE') {
          transformed = val.toUpperCase();
        } else if (casing === 'lowercase') {
          transformed = val.toLowerCase();
        } else if (casing === 'Title Case') {
          transformed = val
            .toLowerCase()
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        }

        if (transformed !== val) {
          newRow[col] = transformed;
          updatedCells++;
        }
      }
    });
    return newRow;
  });

  return {
    data: cleanedData,
    columns: [...columns],
    action: 'Change Text Case',
    description: `Applied ${casing} to ${updatedCells} cell${updatedCells === 1 ? '' : 's'}.`,
    affectedRows: updatedCells,
    affectedCols: colsToProcess.length,
  };
}

/**
 * 12. Normalize numeric strings (e.g., "$1,234.50" -> 1234.5, "25%" -> 0.25).
 * Only applied when explicitly requested.
 */
export function normalizeNumericStrings(data, columns, { column }) {
  if (!column || !columns.includes(column)) {
    return { data, columns, action: 'Normalize Numbers', description: 'Invalid column specified.', affectedRows: 0, affectedCols: 0 };
  }

  let convertedCount = 0;
  const cleanedData = data.map((row) => {
    const newRow = { ...row };
    const rawVal = newRow[column];
    if (!isNullOrEmpty(rawVal)) {
      const strVal = String(rawVal).trim();
      let normalized = strVal;

      if (strVal.endsWith('%')) {
        const stripped = strVal.slice(0, -1).replace(/[,\s]/g, '');
        if (isNumeric(stripped)) {
          normalized = String(Number(stripped) / 100);
          convertedCount++;
        }
      } else {
        // Handle negative accounting format ($1,200) or -$1,200
        let isNegative = false;
        let workStr = strVal;
        if (workStr.startsWith('(') && workStr.endsWith(')')) {
          isNegative = true;
          workStr = workStr.slice(1, -1).trim();
        } else if (workStr.startsWith('-')) {
          isNegative = true;
          workStr = workStr.slice(1).trim();
        }

        // Strip currency symbols and commas
        const stripped = workStr.replace(/[$,\s€£¥]/g, '');
        if (isNumeric(stripped)) {
          const num = (isNegative ? -1 : 1) * Number(stripped);
          normalized = String(num);
          if (normalized !== strVal) convertedCount++;
        }
      }
      newRow[column] = normalized;
    }
    return newRow;
  });

  return {
    data: cleanedData,
    columns: [...columns],
    action: 'Normalize Numbers',
    description: `Normalized ${convertedCount} numeric string${convertedCount === 1 ? '' : 's'} in '${column}'.`,
    affectedRows: convertedCount,
    affectedCols: 1,
  };
}
