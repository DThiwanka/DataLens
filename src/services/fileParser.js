/**
 * DataLens AI - Browser-Native File Parser
 * Built with Papa Parse for robust, spec-compliant client-side parsing.
 * Supports CSV, TSV, and TXT delimited tabular data.
 * Supports large datasets with streaming chunks and live progress reporting.
 */

import Papa from 'papaparse';

export const PARSER_LIMITS = {
  MAX_FILE_SIZE_BYTES: 250 * 1024 * 1024, // 250 MB
  MAX_ROWS: 1500000,                      // 1.5 Million rows
  MAX_COLUMNS: 500,                       // 500 columns
  CHUNK_SIZE_BYTES: 10 * 1024 * 1024,     // 10 MB streaming chunks
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
 * Supports chunk streaming for large CSV/TSV files up to 250 MB with progress reporting.
 * @param {File|string} input - File object from browser input or raw CSV string
 * @param {Object} options - Custom parser options ({ delimiter, fileName, onProgress, maxRows })
 * @returns {Promise<Object>}
 */
export function parseDelimitedData(input, options = {}) {
  return new Promise((resolve, reject) => {
    // 1. File size validation if File object
    let fileName = 'dataset.csv';
    let fileSize = 0;
    const isFile = typeof File !== 'undefined' && input instanceof File;

    if (isFile) {
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

    const maxRows = options.maxRows || PARSER_LIMITS.MAX_ROWS;
    let columns = null;
    const data = [];
    let detectedDelimiter = options.delimiter || '';
    let detectedLinebreak = '\n';
    let isTruncated = false;
    let parseError = null;

    // Configure Papa Parse options with streaming chunking for performance & memory efficiency
    const papaConfig = {
      header: false, // We read headers manually first to ensure deduplication
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // Keep raw strings to preserve exact user formatting & prevent numeric truncation
      delimitersToGuess: [',', '\t', ';', '|'],
      delimiter: options.delimiter || '', // Auto-detect if empty
      encoding: 'utf-8',
      chunkSize: PARSER_LIMITS.CHUNK_SIZE_BYTES,
      chunk: (results, parser) => {
        try {
          if (!results || !results.data || results.data.length === 0) return;

          let rawRows = results.data;

          if (results.meta) {
            if (results.meta.delimiter) detectedDelimiter = results.meta.delimiter;
            if (results.meta.linebreak) detectedLinebreak = results.meta.linebreak;
          }

          // First chunk contains the header
          if (!columns) {
            if (rawRows.length === 0) return;

            const rawHeaders = rawRows[0];
            if (!Array.isArray(rawHeaders) || rawHeaders.length === 0) {
              parseError = new Error('Unable to parse header columns from the file.');
              parser.abort();
              return;
            }

            if (rawHeaders.length > PARSER_LIMITS.MAX_COLUMNS) {
              parseError = new Error(
                `Dataset has ${rawHeaders.length} columns, exceeding the maximum allowed limit of ${PARSER_LIMITS.MAX_COLUMNS} columns.`
              );
              parser.abort();
              return;
            }

            columns = deduplicateHeaders(rawHeaders);
            rawRows = rawRows.slice(1);
          }

          const colLen = columns.length;
          for (let r = 0; r < rawRows.length; r++) {
            const rowArr = rawRows[r];
            if (!Array.isArray(rowArr)) continue;

            const rowObj = {};
            for (let c = 0; c < colLen; c++) {
              const colName = columns[c];
              const cellVal = rowArr[c] !== undefined && rowArr[c] !== null ? String(rowArr[c]) : '';
              rowObj[colName] = cellVal;
            }

            data.push(rowObj);

            if (data.length >= maxRows) {
              isTruncated = true;
              parser.abort();
              break;
            }
          }

          if (options.onProgress && fileSize > 0) {
            const cursor = results.meta?.cursor || 0;
            const percent = Math.min(100, Math.round((cursor / fileSize) * 100));
            options.onProgress({
              percent,
              rowsLoaded: data.length,
              bytesRead: cursor,
            });
          }
        } catch (err) {
          parseError = err;
          parser.abort();
        }
      },
      complete: () => {
        if (parseError) {
          return reject(parseError);
        }

        if (!columns || columns.length === 0) {
          return reject(new Error('Dataset must contain at least a header row and one data row.'));
        }

        if (data.length === 0) {
          return reject(new Error('Dataset must contain at least a header row and one data row.'));
        }

        resolve({
          data,
          columns,
          rowCount: data.length,
          columnCount: columns.length,
          fileName,
          fileSize,
          delimiter: detectedDelimiter || ',',
          linebreak: detectedLinebreak || '\n',
          truncated: isTruncated,
          errors: [],
        });
      },
      error: (error) => {
        reject(new Error(`CSV Parsing Error: ${error.message}`));
      },
    };

    // Execute parse
    Papa.parse(input, papaConfig);
  });
}
