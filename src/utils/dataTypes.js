/**
 * DataLens AI - Data Type Detection & Parsing Utilities
 * 100% Client-Side In-Memory Execution
 */

/**
 * Checks if a value is effectively null, undefined, or empty string.
 */
export function isNullOrEmpty(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  return false;
}

/**
 * Checks if a string represents a valid boolean.
 */
export function isBoolean(val) {
  if (typeof val === 'boolean') return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === 'false' || s === 'yes' || s === 'no';
  }
  return false;
}

/**
 * Checks if a value is numeric.
 * Accurately excludes empty strings, boolean representations, or strings that only start with numbers.
 */
export function isNumeric(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'number') return !isNaN(val) && isFinite(val);
  if (typeof val === 'boolean') return false;
  if (typeof val !== 'string') return false;

  const trimmed = val.trim();
  if (trimmed === '') return false;

  // Avoid treating strings with commas or currency as numeric unless strictly pure number
  // Test standard JS numeric string format
  const num = Number(trimmed);
  return !isNaN(num) && isFinite(num);
}

/**
 * Checks if a string is a recognizable date.
 * Validates against common formats: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY, ISO strings.
 * Avoids misclassifying pure numbers (e.g. 2024 or 12345) as dates.
 */
export function isDateString(val) {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length < 6 || trimmed.length > 35) return false;

  // Don't treat pure numbers as dates
  if (/^\d+$/.test(trimmed)) return false;

  // Regex patterns for common date structures
  const datePattern = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(T|\s|$)/;
  const usDatePattern = /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/;
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

  if (datePattern.test(trimmed) || usDatePattern.test(trimmed) || isoPattern.test(trimmed)) {
    const timestamp = Date.parse(trimmed);
    if (!isNaN(timestamp)) {
      const year = new Date(timestamp).getFullYear();
      return year >= 1900 && year <= 2100;
    }
  }

  return false;
}

/**
 * Detects the data type of an individual cell value.
 * Returns: 'empty' | 'numeric' | 'boolean' | 'date' | 'text'
 */
export function detectValueType(val) {
  if (isNullOrEmpty(val)) return 'empty';
  if (isNumeric(val)) return 'numeric';
  if (isBoolean(val)) return 'boolean';
  if (isDateString(val)) return 'date';
  return 'text';
}

/**
 * Analyzes an array of values for a column and infers the overall data type.
 * Type precedence:
 * - If > 80% non-empty values are numeric -> 'numeric'
 * - If > 80% non-empty values are dates -> 'date'
 * - If > 85% non-empty values are boolean -> 'boolean'
 * - Otherwise -> 'text'
 */
export function inferColumnType(values = []) {
  let nonEmptyCount = 0;
  let numCount = 0;
  let boolCount = 0;
  let dateCount = 0;

  // Sample up to 1000 items for high performance on large datasets
  const sampleLimit = Math.min(values.length, 1000);
  const step = Math.max(1, Math.floor(values.length / sampleLimit));

  for (let i = 0; i < values.length && nonEmptyCount < sampleLimit; i += step) {
    const val = values[i];
    if (isNullOrEmpty(val)) continue;

    nonEmptyCount++;
    if (isNumeric(val)) {
      numCount++;
    } else if (isBoolean(val)) {
      boolCount++;
    } else if (isDateString(val)) {
      dateCount++;
    }
  }

  if (nonEmptyCount === 0) return 'text';

  if (numCount / nonEmptyCount >= 0.75) return 'numeric';
  if (dateCount / nonEmptyCount >= 0.75) return 'date';
  if (boolCount / nonEmptyCount >= 0.85) return 'boolean';

  return 'text';
}

/**
 * Coerces a value to its proper type based on inferred or specified type.
 */
export function coerceValue(val, type) {
  if (isNullOrEmpty(val)) return null;

  if (type === 'numeric') {
    if (typeof val === 'number') return val;
    // Strip commas, spaces, currency symbols if needed
    const cleaned = String(val).replace(/[$,\s]/g, '');
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }

  if (type === 'boolean') {
    if (typeof val === 'boolean') return val;
    const s = String(val).trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === '1';
  }

  if (type === 'date') {
    const timestamp = Date.parse(val);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  return String(val);
}
