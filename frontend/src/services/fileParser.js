/**
 * DataLens AI - Browser-Native File Parser
 * Built with Papa Parse for robust, spec-compliant client-side parsing.
 * Supports CSV, TSV, and TXT delimited tabular data.
 */

import Papa from 'papaparse';

export const PARSER_LIMITS = {
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024, // 15 MB
  MAX_ROWS: 100000,
  MAX_COLUMNS: 200,
};

/**
 * Deduplicates column header names to prevent object key collisions.
 * e.g., ['Name', 'Name', 'Age'] => ['Name', 'Name_2', 'Age']
 */
export function deduplicateHeaders(headers) {
  const seen = new Map();
  return headers.map((rawHeader, idx) => {
    let header = (rawHeader || '').trim();
    if (!header) {
      header = `Column_${idx + 1}`;
    }

    if (seen.has(header)) {
      const count = seen.get(header) + 1;
      seen.set(header, count);
      return `${header}_${count}`;
    } else {
      seen.set(header, 1);
      return header;
    }
  });
}

/**
 * Parses raw text or file input into structured row objects and column lists.
 * @param {File|string} input - File object from browser input or raw CSV string
 * @param {Object} options - Custom parser options
 * @returns {Promise<Object>}
 */
export function parseDelimitedData(input, options = {}) {
  return new Promise((resolve, reject) => {
    // 1. File size validation if File object
    let fileName = 'dataset.csv';
    let fileSize = 0;

    if (typeof File !== 'undefined' && input instanceof File) {
      fileName = input.name;
      fileSize = input.size;

      if (fileSize === 0) {
        return reject(new Error('The uploaded file is empty (0 bytes). Please upload a valid CSV or TSV file.'));
      }

      if (fileSize > PARSER_LIMITS.MAX_FILE_SIZE_BYTES) {
        return reject(
          new Error(
            `File size (${(fileSize / (1024 * 1024)).toFixed(1)} MB) exceeds browser safe limit of ${PARSER_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`
          )
        );
      }
    } else if (typeof input === 'string') {
      fileSize = new Blob([input]).size;
      fileName = options.fileName || 'sample-data.csv';

      if (!input.trim()) {
        return reject(new Error('Input text data is empty. Please provide tabular data.'));
      }
    }

    // Configure Papa Parse options
    const papaConfig = {
      header: false, // We read headers manually first to ensure deduplication
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // Keep raw strings to preserve exact user formatting & prevent numeric truncation
      delimitersToGuess: [',', '\t', ';', '|'],
      delimiter: options.delimiter || '', // Auto-detect if empty
      encoding: 'utf-8',
      preview: PARSER_LIMITS.MAX_ROWS + 5, // Prevent infinite memory explosion
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            return reject(new Error('No tabular records found in the uploaded file.'));
          }

          const rawRows = results.data;
          if (rawRows.length < 2) {
            return reject(
              new Error('Dataset must contain at least a header row and one data row.')
            );
          }

          // Row 0 is headers
          const rawHeaders = rawRows[0];
          if (!Array.isArray(rawHeaders) || rawHeaders.length === 0) {
            return reject(new Error('Unable to parse header columns from the file.'));
          }

          if (rawHeaders.length > PARSER_LIMITS.MAX_COLUMNS) {
            return reject(
              new Error(
                `Dataset has ${rawHeaders.length} columns, exceeding the maximum allowed limit of ${PARSER_LIMITS.MAX_COLUMNS} columns.`
              )
            );
          }

          const columns = deduplicateHeaders(rawHeaders);
          const rawDataRows = rawRows.slice(1);

          if (rawDataRows.length > PARSER_LIMITS.MAX_ROWS) {
            return reject(
              new Error(
                `Dataset exceeds the maximum limit of ${PARSER_LIMITS.MAX_ROWS.toLocaleString()} rows. Please truncate or filter prior to upload.`
              )
            );
          }

          // Convert array rows to object rows mapped to deduplicated column names
          const data = [];
          for (let r = 0; r < rawDataRows.length; r++) {
            const rowArr = rawDataRows[r];
            if (!Array.isArray(rowArr)) continue;

            const rowObj = {};
            for (let c = 0; c < columns.length; c++) {
              const colName = columns[c];
              // Preserve raw string representation without premature loss of leading spaces or formatting
              const cellVal = rowArr[c] !== undefined && rowArr[c] !== null ? String(rowArr[c]) : '';
              rowObj[colName] = cellVal;
            }

            data.push(rowObj);
          }

          if (data.length === 0) {
            return reject(new Error('Dataset contains no data rows below the header.'));
          }

          resolve({
            data,
            columns,
            rowCount: data.length,
            columnCount: columns.length,
            fileName,
            fileSize,
            delimiter: results.meta.delimiter || ',',
            linebreak: results.meta.linebreak || '\n',
            truncated: results.meta.truncated || false,
            errors: results.errors || [],
          });
        } catch (err) {
          reject(new Error(`Failed to parse file: ${err.message}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV Parsing Error: ${error.message}`));
      },
    };

    // Execute parse
    Papa.parse(input, papaConfig);
  });
}

