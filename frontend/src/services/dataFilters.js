/**
 * DataLens AI - Filtering, Searching & Sorting Engine
 * High-performance browser-based query executor for tabular datasets.
 */

import { isNullOrEmpty, isNumeric } from '../utils/dataTypes.js';

/**
 * Filter operators catalog with human-readable labels.
 */
export const FILTER_OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals (=)' },
  { value: 'not_equals', label: 'Does not equal (≠)' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'greater_than', label: 'Greater than (>)' },
  { value: 'greater_equal', label: 'Greater than or equal (≥)' },
  { value: 'less_than', label: 'Less than (<)' },
  { value: 'less_equal', label: 'Less than or equal (≤)' },
  { value: 'between', label: 'Between' },
  { value: 'is_empty', label: 'Is empty / missing' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

/**
 * Tests if a row passes a single column filter condition.
 */
export function matchesFilterCondition(rowValue, operator, filterVal1, filterVal2) {
  const strVal = rowValue !== null && rowValue !== undefined ? String(rowValue).trim() : '';
  const isEmpty = isNullOrEmpty(strVal);

  if (operator === 'is_empty') {
    return isEmpty;
  }
  if (operator === 'is_not_empty') {
    return !isEmpty;
  }

  // If testing values, but cell is empty, it fails matching non-empty criteria
  if (isEmpty) {
    return operator === 'not_equals' || operator === 'not_contains';
  }

  const query1 = filterVal1 !== null && filterVal1 !== undefined ? String(filterVal1).trim() : '';
  const query2 = filterVal2 !== null && filterVal2 !== undefined ? String(filterVal2).trim() : '';

  switch (operator) {
    case 'contains':
      return strVal.toLowerCase().includes(query1.toLowerCase());

    case 'not_contains':
      return !strVal.toLowerCase().includes(query1.toLowerCase());

    case 'equals':
      return strVal.toLowerCase() === query1.toLowerCase();

    case 'not_equals':
      return strVal.toLowerCase() !== query1.toLowerCase();

    case 'starts_with':
      return strVal.toLowerCase().startsWith(query1.toLowerCase());

    case 'ends_with':
      return strVal.toLowerCase().endsWith(query1.toLowerCase());

    case 'greater_than': {
      if (isNumeric(strVal) && isNumeric(query1)) {
        return Number(strVal) > Number(query1);
      }
      const dateVal = Date.parse(strVal);
      const dateQ1 = Date.parse(query1);
      if (!isNaN(dateVal) && !isNaN(dateQ1)) {
        return dateVal > dateQ1;
      }
      return strVal.localeCompare(query1) > 0;
    }

    case 'greater_equal': {
      if (isNumeric(strVal) && isNumeric(query1)) {
        return Number(strVal) >= Number(query1);
      }
      const dateVal = Date.parse(strVal);
      const dateQ1 = Date.parse(query1);
      if (!isNaN(dateVal) && !isNaN(dateQ1)) {
        return dateVal >= dateQ1;
      }
      return strVal.localeCompare(query1) >= 0;
    }

    case 'less_than': {
      if (isNumeric(strVal) && isNumeric(query1)) {
        return Number(strVal) < Number(query1);
      }
      const dateVal = Date.parse(strVal);
      const dateQ1 = Date.parse(query1);
      if (!isNaN(dateVal) && !isNaN(dateQ1)) {
        return dateVal < dateQ1;
      }
      return strVal.localeCompare(query1) < 0;
    }

    case 'less_equal': {
      if (isNumeric(strVal) && isNumeric(query1)) {
        return Number(strVal) <= Number(query1);
      }
      const dateVal = Date.parse(strVal);
      const dateQ1 = Date.parse(query1);
      if (!isNaN(dateVal) && !isNaN(dateQ1)) {
        return dateVal <= dateQ1;
      }
      return strVal.localeCompare(query1) <= 0;
    }

    case 'between': {
      if (isNumeric(strVal) && isNumeric(query1) && isNumeric(query2)) {
        const val = Number(strVal);
        const low = Math.min(Number(query1), Number(query2));
        const high = Math.max(Number(query1), Number(query2));
        return val >= low && val <= high;
      }
      const dateVal = Date.parse(strVal);
      const dateQ1 = Date.parse(query1);
      const dateQ2 = Date.parse(query2);
      if (!isNaN(dateVal) && !isNaN(dateQ1) && !isNaN(dateQ2)) {
        const low = Math.min(dateQ1, dateQ2);
        const high = Math.max(dateQ1, dateQ2);
        return dateVal >= low && dateVal <= high;
      }
      return strVal >= query1 && strVal <= query2;
    }

    default:
      return true;
  }
}

/**
 * Filters and searches dataset with global search and multiple simultaneous filters.
 * @param {Array<Object>} data
 * @param {Array<String>} columns
 * @param {string} searchQuery - Global query across all columns
 * @param {Array<Object>} filters - List of { id, column, operator, value, value2 }
 */
export function filterDataset(data = [], columns = [], searchQuery = '', filters = []) {
  if (!data || data.length === 0) return [];

  const trimmedQuery = (searchQuery || '').trim().toLowerCase();
  const activeFilters = (filters || []).filter(
    (f) =>
      f.column &&
      columns.includes(f.column) &&
      f.operator &&
      (f.operator === 'is_empty' ||
        f.operator === 'is_not_empty' ||
        (f.value !== undefined && f.value !== ''))
  );

  if (!trimmedQuery && activeFilters.length === 0) {
    return data;
  }

  return data.filter((row) => {
    // 1. Global search match
    if (trimmedQuery) {
      let matchedSearch = false;
      for (let i = 0; i < columns.length; i++) {
        const val = row[columns[i]];
        if (val !== null && val !== undefined) {
          if (String(val).toLowerCase().includes(trimmedQuery)) {
            matchedSearch = true;
            break;
          }
        }
      }
      if (!matchedSearch) return false;
    }

    // 2. Column filters match (ALL must pass - AND logic)
    for (let f = 0; f < activeFilters.length; f++) {
      const filter = activeFilters[f];
      const cellVal = row[filter.column];
      if (!matchesFilterCondition(cellVal, filter.operator, filter.value, filter.value2)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts dataset by column with natural numeric, date, and string sorting.
 * @param {Array<Object>} data
 * @param {string} column - Column to sort by
 * @param {'asc'|'desc'|null} direction - Sort direction
 */
export function sortDataset(data = [], column = null, direction = 'asc') {
  if (!column || !direction || data.length <= 1) return data;

  const sorted = [...data];
  const mult = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    const valA = a[column];
    const valB = b[column];

    // Handle nulls / empties - always push to end
    const aEmpty = isNullOrEmpty(valA);
    const bEmpty = isNullOrEmpty(valB);
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    // Check if numeric
    const aNum = isNumeric(valA);
    const bNum = isNumeric(valB);
    if (aNum && bNum) {
      return (Number(valA) - Number(valB)) * mult;
    }

    // Date comparison
    const aDate = Date.parse(valA);
    const bDate = Date.parse(valB);
    if (!isNaN(aDate) && !isNaN(bDate) && !aNum && !bNum) {
      return (aDate - bDate) * mult;
    }

    // Natural string comparison
    return String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' }) * mult;
  });

  return sorted;
}

/**
 * Paginates dataset.
 */
export function paginateDataset(data = [], page = 1, pageSize = 25) {
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const rows = data.slice(startIndex, endIndex);

  return {
    rows,
    total,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    pageSize,
  };
}
