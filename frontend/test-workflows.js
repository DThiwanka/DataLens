/**
 * DataLens AI - Automated Workflow Verification Script
 * Validates critical requirements without any backend.
 */

import { parseDelimitedData, deduplicateHeaders } from './src/services/fileParser.js';
import { generateDatasetProfile } from './src/services/dataProfiler.js';
import { filterDataset, sortDataset, paginateDataset } from './src/services/dataFilters.js';
import {
  removeDuplicateRows,
  removeEmptyRows,
  removeEmptyColumns,
  dropColumns,
  renameColumn,
  normalizeHeaders,
  trimWhitespace,
  findAndReplace,
  fillMissingValues,
  changeTextCase,
  normalizeNumericStrings,
} from './src/services/dataCleaner.js';
import { SAMPLE_DATASETS } from './src/utils/sampleDatasets.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('=== Starting DataLens AI Workflow Verification ===\n');

  // Test 1: Header Deduplication
  console.log('Test 1: Header Deduplication');
  const headers = ['Name', 'Age', 'Name', 'Location', 'Name'];
  const deduped = deduplicateHeaders(headers);
  assert(deduped[0] === 'Name', 'First Name kept');
  assert(deduped[2] === 'Name_2', 'Duplicate renamed to Name_2');
  assert(deduped[4] === 'Name_3', 'Duplicate renamed to Name_3');

  // Test 2: Ingest Sample CSV
  console.log('\nTest 2: CSV Parsing & Delimiter Handling');
  const sample = SAMPLE_DATASETS[0];
  const parsed = await parseDelimitedData(sample.csv, { fileName: 'superstore.csv' });
  assert(parsed.rowCount === 50, `Parsed 50 rows (got ${parsed.rowCount})`);
  assert(parsed.columnCount === 12, `Parsed 12 columns (got ${parsed.columnCount})`);
  assert(parsed.columns.includes('Order_ID'), 'Contains Order_ID column');

  // Test 3: Quoted fields, escaped quotes, commas inside quotes
  console.log('\nTest 3: Complex Quoted Fields Parsing');
  const quotedCsv = `Product,Description,Price\n"Laptop, Pro","16"" Retina Display",1999.99\n"Desk Chair","Ergonomic ""Mesh""",249.50`;
  const parsedQuoted = await parseDelimitedData(quotedCsv, { fileName: 'complex.csv' });
  assert(parsedQuoted.rowCount === 2, 'Parsed 2 complex rows');
  assert(parsedQuoted.data[0]['Product'] === 'Laptop, Pro', 'Delimiters within quotes parsed cleanly');
  assert(parsedQuoted.data[0]['Description'] === '16" Retina Display', 'Escaped double quotes parsed cleanly');

  // Test 4: TSV Parsing (Tab Delimited)
  console.log('\nTest 4: TSV Tab-Delimited Parsing');
  const tsvData = `User\tEmail\tScore\nAlice\talice@example.com\t95\nBob\tbob@example.com\t88`;
  const parsedTsv = await parseDelimitedData(tsvData, { fileName: 'users.tsv' });
  assert(parsedTsv.rowCount === 2, 'Parsed 2 TSV rows');
  assert(parsedTsv.delimiter === '\t', `Auto-detected tab delimiter (got ${JSON.stringify(parsedTsv.delimiter)})`);
  assert(parsedTsv.columns.includes('Email'), 'TSV columns parsed accurately');

  // Test 5: Dataset Profiling & Statistical Calculations
  console.log('\nTest 5: Dataset Profiling & Statistics');
  const profile = generateDatasetProfile(parsed.data, parsed.columns, { fileName: 'superstore.csv' });
  assert(profile.rowCount === 50, 'Profile row count is 50');
  assert(profile.columnCount === 12, 'Profile column count is 12');
  assert(profile.typeDistribution.numeric >= 4, `Detected numeric columns (${profile.typeDistribution.numeric})`);

  // Verify numerical stats for Sales column
  const salesProfile = profile.columnProfiles.find((p) => p.name === 'Sales');
  assert(salesProfile !== undefined, 'Sales profile exists');
  assert(salesProfile.type === 'numeric', 'Sales inferred as numeric');
  assert(salesProfile.stats.mean > 0, `Sales mean computed: ${salesProfile.stats.mean}`);
  assert(salesProfile.stats.min < salesProfile.stats.max, 'Sales min is strictly less than max');

  // Test 6: Search, Filtering & Sorting
  console.log('\nTest 6: Search, Filter, Sort & Pagination');
  // Global search
  const searched = filterDataset(parsed.data, parsed.columns, 'North America');
  assert(searched.length > 0 && searched.length < parsed.data.length, `Global search filtered to ${searched.length} rows`);

  // Operator: Greater than numeric filter
  const filteredNumeric = filterDataset(parsed.data, parsed.columns, '', [
    { column: 'Quantity', operator: 'greater_than', value: '3' },
  ]);
  assert(filteredNumeric.every((r) => Number(r.Quantity) > 3), 'All filtered rows have Quantity > 3');

  // Sorting
  const sorted = sortDataset(parsed.data, 'Sales', 'desc');
  assert(Number(sorted[0].Sales) >= Number(sorted[1].Sales), 'Sorted descending by Sales');

  // Pagination
  const pageResult = paginateDataset(sorted, 1, 10);
  assert(pageResult.rows.length === 10, 'Paginated 10 rows per page');
  assert(pageResult.totalPages === 5, '5 total pages for 50 rows');

  // Test 7: Data Cleaning Operations
  console.log('\nTest 7: Data Cleaning Studio Operations');
  // Duplicate removal
  const dataWithDupes = [...parsed.data, { ...parsed.data[0] }, { ...parsed.data[1] }];
  const dedupeResult = removeDuplicateRows(dataWithDupes, parsed.columns);
  assert(dedupeResult.affectedRows === 2, `Removed exactly 2 duplicate rows (got ${dedupeResult.affectedRows})`);
  assert(dedupeResult.data.length === parsed.data.length, 'Dataset restored to original count after deduplication');

  // Trim whitespace
  const messyData = [{ Name: '  Alice  ', City: ' New York ' }];
  const trimmed = trimWhitespace(messyData, ['Name', 'City'], 'all');
  assert(trimmed.data[0].Name === 'Alice', 'Trimmed Name whitespace');
  assert(trimmed.data[0].City === 'New York', 'Trimmed City whitespace');

  // Find & Replace
  const replaced = findAndReplace(parsed.data, parsed.columns, {
    column: 'Region',
    findValue: 'Europe',
    replaceValue: 'EU Region',
    matchType: 'exact',
  });
  assert(replaced.data.some((r) => r.Region === 'EU Region'), 'Find & Replace successfully updated Region');
  assert(!replaced.data.some((r) => r.Region === 'Europe'), 'No old Europe values remain');

  // Header Normalization
  const normResult = normalizeHeaders(parsed.data, parsed.columns, 'snake_case');
  assert(normResult.columns.every((c) => c === c.toLowerCase()), 'Normalized headers are lower case');

  // Normalize Numeric Strings
  const currencyData = [{ Price: '$1,250.00' }, { Price: '$99.50' }];
  const cleanedCurrency = normalizeNumericStrings(currencyData, ['Price'], { column: 'Price' });
  assert(cleanedCurrency.data[0].Price === '1250', `Cleaned $1,250.00 to 1250 (got ${cleanedCurrency.data[0].Price})`);
  assert(cleanedCurrency.data[1].Price === '99.5', `Cleaned $99.50 to 99.5 (got ${cleanedCurrency.data[1].Price})`);

  // Fill Missing Values
  const missingData = [{ Status: 'Active' }, { Status: '' }, { Status: null }];
  const filled = fillMissingValues(missingData, ['Status'], {
    column: 'Status',
    strategy: 'unknown',
  });
  assert(filled.data[1].Status === 'Unknown', 'Filled empty cell with "Unknown"');
  assert(filled.data[2].Status === 'Unknown', 'Filled null cell with "Unknown"');

  // Test 8: Malformed & Invalid Files
  console.log('\nTest 8: Error Handling for Malformed & Empty Data');
  try {
    await parseDelimitedData('', { fileName: 'empty.csv' });
    assert(false, 'Should have rejected empty string');
  } catch (err) {
    assert(true, `Correctly rejected empty input: ${err.message}`);
  }

  console.log(`\n=================================================`);
  console.log(`Workflow Verification Complete: ${passedTests}/${totalTests} tests passed.`);
  console.log(`=================================================`);
}

runTests();

