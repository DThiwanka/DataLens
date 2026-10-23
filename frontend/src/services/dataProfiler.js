/**
 * DataLens AI - Data Profiling Engine
 * Computes deep statistical metrics, column profiling, missing value distributions,
 * and data health indices completely client-side.
 */

import { inferColumnType, isNullOrEmpty, isNumeric, isDateString } from '../utils/dataTypes.js';

/**
 * Calculates median of an array of numbers.
 */
function calculateMedian(sortedNumbers) {
  if (sortedNumbers.length === 0) return null;
  const mid = Math.floor(sortedNumbers.length / 2);
  return sortedNumbers.length % 2 !== 0
    ? sortedNumbers[mid]
    : (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2;
}

/**
 * Calculates population standard deviation.
 */
function calculateStdDev(numbers, mean) {
  if (numbers.length < 2) return 0;
  const sumOfSquares = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  return Math.sqrt(sumOfSquares / (numbers.length - 1)); // Sample standard deviation
}

/**
 * Identifies duplicate rows in the dataset based on row string representation.
 */
export function countDuplicateRows(data, columns) {
  if (!data || data.length === 0) return 0;
  const seen = new Set();
  let duplicates = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    // Create deterministic key of row values matching dataCleaner
    const key = JSON.stringify(columns.map((col) => row[col] ?? ''));
    if (!seen.has(key)) {
      seen.add(key);
    } else {
      duplicates++;
    }
  }

  return duplicates;
}

/**
 * Generates comprehensive profile for the dataset and every column within it.
 * @param {Array<Object>} data - Array of row objects
 * @param {Array<String>} columns - Array of column names
 * @param {Object} metadata - Optional dataset metadata (fileName, fileSize, etc.)
 */
export function generateDatasetProfile(data = [], columns = [], metadata = {}) {
  const rowCount = data.length;
  const columnCount = columns.length;

  if (rowCount === 0 || columnCount === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      totalCells: 0,
      missingCells: 0,
      missingRate: 0,
      duplicateRows: 0,
      duplicateRate: 0,
      healthScore: 100,
      columnProfiles: [],
      typeDistribution: { numeric: 0, text: 0, date: 0, boolean: 0 },
      metadata,
    };
  }

  const totalCells = rowCount * columnCount;
  let totalMissingCells = 0;

  // Track duplicate rows
  const duplicateRows = countDuplicateRows(data, columns);
  const duplicateRate = (duplicateRows / rowCount) * 100;

  const columnProfiles = [];
  const typeDistribution = { numeric: 0, text: 0, date: 0, boolean: 0 };

  // Profile each column
  columns.forEach((colName) => {
    const rawValues = data.map((row) => row[colName]);
    const inferredType = inferColumnType(rawValues);

    if (typeDistribution[inferredType] !== undefined) {
      typeDistribution[inferredType]++;
    } else {
      typeDistribution.text++;
    }

    let emptyCount = 0;
    let validCount = 0;
    const valueFrequencyMap = new Map();
    const numericValues = [];
    const dateValues = [];

    rawValues.forEach((val) => {
      if (isNullOrEmpty(val)) {
        emptyCount++;
        totalMissingCells++;
      } else {
        validCount++;
        const strVal = String(val).trim();
        valueFrequencyMap.set(strVal, (valueFrequencyMap.get(strVal) || 0) + 1);

        if (inferredType === 'numeric') {
          // Parse number safely
          if (isNumeric(strVal)) {
            numericValues.push(Number(strVal));
          } else {
            // Check if it's formatted number like $1,200.00
            const cleaned = strVal.replace(/[$,\s%]/g, '');
            if (isNumeric(cleaned)) {
              numericValues.push(Number(cleaned));
            }
          }
        } else if (inferredType === 'date') {
          if (isDateString(strVal)) {
            const timestamp = Date.parse(strVal);
            if (!isNaN(timestamp)) {
              dateValues.push(timestamp);
            }
          }
        }
      }
    });

    const uniqueCount = valueFrequencyMap.size;
    const missingPercentage = rowCount > 0 ? (emptyCount / rowCount) * 100 : 0;
    const uniquenessPercentage = validCount > 0 ? (uniqueCount / validCount) * 100 : 0;

    // Top frequent values
    const topValues = Array.from(valueFrequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([value, count]) => ({
        value,
        count,
        percentage: (count / (validCount || 1)) * 100,
      }));

    // Numerical statistics
    let stats = null;
    if (inferredType === 'numeric' && numericValues.length > 0) {
      numericValues.sort((a, b) => a - b);
      const min = numericValues[0];
      const max = numericValues[numericValues.length - 1];
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const mean = sum / numericValues.length;
      const median = calculateMedian(numericValues);
      const stdDev = calculateStdDev(numericValues, mean);
      const zeroes = numericValues.filter((v) => v === 0).length;
      const negatives = numericValues.filter((v) => v < 0).length;

      // Histogram bins (5-7 bins for mini spark distribution)
      const binCount = Math.min(7, numericValues.length);
      const bins = [];
      if (max > min) {
        const binWidth = (max - min) / binCount;
        for (let b = 0; b < binCount; b++) {
          const binStart = min + b * binWidth;
          const binEnd = min + (b + 1) * binWidth;
          const count = numericValues.filter(
            (v) => (b === binCount - 1 ? v >= binStart && v <= binEnd : v >= binStart && v < binEnd)
          ).length;
          bins.push({
            label: `${binStart.toFixed(1)} - ${binEnd.toFixed(1)}`,
            count,
          });
        }
      }

      stats = {
        min,
        max,
        sum,
        mean,
        median,
        stdDev,
        zeroes,
        negatives,
        validNumericCount: numericValues.length,
        bins,
      };
    }

    // Date statistics
    let dateStats = null;
    if (inferredType === 'date' && dateValues.length > 0) {
      dateValues.sort((a, b) => a - b);
      let earliest;
      let latest;
      try {
        earliest = new Date(dateValues[0]).toISOString().split('T')[0];
        latest = new Date(dateValues[dateValues.length - 1]).toISOString().split('T')[0];
      } catch {
        earliest = String(new Date(dateValues[0]).toLocaleDateString());
        latest = String(new Date(dateValues[dateValues.length - 1]).toLocaleDateString());
      }
      const spanDays = Math.max(
        0,
        Math.round((dateValues[dateValues.length - 1] - dateValues[0]) / (1000 * 60 * 60 * 24))
      );

      dateStats = {
        earliest,
        latest,
        spanDays,
        validDateCount: dateValues.length,
      };
    }

    columnProfiles.push({
      name: colName,
      type: inferredType,
      totalRows: rowCount,
      validCount,
      emptyCount,
      missingPercentage,
      uniqueCount,
      uniquenessPercentage,
      topValues,
      stats,
      dateStats,
    });
  });

  const missingRate = totalCells > 0 ? (totalMissingCells / totalCells) * 100 : 0;

  // Calculate Data Quality / Health Score (0 - 100)
  // Penalize missing cells (up to 40 pts) and duplicate rows (up to 30 pts)
  const completenessPenalty = Math.min(40, missingRate * 1.5);
  const duplicatePenalty = Math.min(30, duplicateRate * 1.5);
  const healthScore = Math.max(0, Math.round(100 - completenessPenalty - duplicatePenalty));

  return {
    rowCount,
    columnCount,
    totalCells,
    missingCells: totalMissingCells,
    missingRate,
    duplicateRows,
    duplicateRate,
    healthScore,
    columnProfiles,
    typeDistribution,
    metadata,
  };
}
