/**
 * DataLens AI - Formatting Utilities
 */

/**
 * Formats a number with comma separators and decimal precision.
 */
export function formatNumber(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const num = Number(val);
  if (!isFinite(num)) return '—';

  // If integer or decimals = 0, format without decimals
  if (Number.isInteger(num) && decimals === 0) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  // Adaptive decimals: show decimals only if fraction exists
  if (Number.isInteger(num)) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formats compact numbers (e.g., 1.2K, 3.4M).
 */
export function formatCompactNumber(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const num = Number(val);
  if (!isFinite(num)) return '—';

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Formats percentage value.
 */
export function formatPercent(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return '0.0%';
  const num = Number(val);
  return `${num.toFixed(decimals)}%`;
}

/**
 * Formats byte sizes into human readable units (B, KB, MB, GB).
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] || 'B'}`;
}

/**
 * Formats a date string or timestamp.
 */
export function formatDate(val) {
  if (!val) return '—';
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncates long strings with ellipsis.
 */
export function truncate(str, maxLen = 30) {
  if (!str) return '';
  const s = String(str);
  if (s.length <= maxLen) return s;
  return s.substring(0, maxLen - 3) + '...';
}

