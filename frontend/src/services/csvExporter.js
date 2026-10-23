/**
 * DataLens AI - CSV & Data Export Engine
 * Generates spec-compliant UTF-8 CSV files with BOM for Excel and spreadsheet compatibility.
 * 100% Client-side using native Blob & download links.
 */

import Papa from 'papaparse';

/**
 * Downloads data as a CSV file in the browser.
 * @param {Array<Object>} data - Array of row objects
 * @param {Array<String>} columns - Array of columns to export in desired order
 * @param {String} filename - Output file name
 * @returns {Boolean} - Success status
 */
export function exportToCsv(data = [], columns = [], filename = 'datalens-export.csv') {
  if (!data || data.length === 0) {
    throw new Error('There is no data to export.');
  }

  const exportColumns = columns && columns.length > 0 ? columns : Object.keys(data[0] || {});
  if (exportColumns.length === 0) {
    throw new Error('No valid columns found to export.');
  }

  // Filter and order data rows strictly according to exportColumns
  const formattedRows = data.map((row) => {
    const orderedObj = {};
    exportColumns.forEach((col) => {
      orderedObj[col] = row[col] !== undefined && row[col] !== null ? row[col] : '';
    });
    return orderedObj;
  });

  // Use PapaParse unparse to safely escape quotes, commas, newlines, and unicode
  const csvString = Papa.unparse(formattedRows, {
    columns: exportColumns,
    quotes: false, // PapaParse automatically quotes fields containing quotes, delimiters or newlines
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ',',
    header: true,
    newline: '\r\n',
  });

  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel, Numbers, and Google Sheets
  // properly render international UTF-8 characters and accented text
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  // Create temporary invisible anchor to trigger browser download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after slight delay to ensure browser initiated stream
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return true;
}

/**
 * Downloads JSON data in the browser.
 */
export function exportToJson(data = [], filename = 'datalens-data.json') {
  if (!data || data.length === 0) {
    throw new Error('There is no data to export.');
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanFilename = filename.endsWith('.json') ? filename : `${filename}.json`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return true;
}

