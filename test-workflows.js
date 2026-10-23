/**
 * DataLens AI - Comprehensive Automated Test & Verification Suite
 * Thoroughly validates parsing, profiling, filtering, sorting, cleaning,
 * and exporting with deterministic datasets.
 */

import { parseDelimitedData, deduplicateHeaders } from './src/services/fileParser.js';
import { generateDatasetProfile, countDuplicateRows } from './src/services/dataProfiler.js';
import { filterDataset, sortDataset, paginateDataset, matchesFilterCondition } from './src/services/dataFilters.js';
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
} from './src/services/dataCleaner.js';
import { exportToCsv } from './src/services/csvExporter.js';
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
  console.log('=== Starting DataLens AI Comprehensive QA & Stability Suite ===\n');

  // 1. Header Deduplication
  console.log('Group 1: Header Deduplication & Normalization');
  const headers = ['Name', 'Age', 'Name', '', 'Name', '  City  '];
  const deduped = deduplicateHeaders(headers);
  assert(deduped[0] === 'Name', 'First occurrence kept');
  assert(deduped[2] === 'Name_2', 'Second duplicate renamed to Name_2');
  assert(deduped[3] === 'Column_4', 'Empty header named Column_4');
  assert(deduped[4] === 'Name_3', 'Third duplicate renamed to Name_3');
  assert(deduped[5] === 'City', 'Whitespace in header trimmed');

  // 2. Standard and Sample Ingestion
  console.log('\nGroup 2: Sample Dataset Ingestion');
  const sample = SAMPLE_DATASETS[0];
  const parsed = await parseDelimitedData(sample.csv, { fileName: 'superstore.csv' });
  assert(parsed.rowCount === 50, `Parsed 50 rows (got ${parsed.rowCount})`);
  assert(parsed.columnCount === 12, `Parsed 12 columns (got ${parsed.columnCount})`);
  assert(parsed.columns.includes('Order_ID'), 'Contains Order_ID column');

  // 3. Complex CSV Parsing (Quotes, Comma inside quotes, Newlines inside quotes, Unicode)
  console.log('\nGroup 3: Complex RFC 4180 CSV & Unicode Handling');
  const complexCsv = `Item,Notes,Amount,Unicode\n"Widget, Standard","Includes ""special"" tag",45.50,"Zürich & Tokyo 富士山"\n"Pro ""Max""","Multi-line\r\nDescription",120.00,"Café & München"`;
  const parsedComplex = await parseDelimitedData(complexCsv, { fileName: 'complex.csv' });
  assert(parsedComplex.rowCount === 2, 'Parsed 2 multiline/quoted rows');
  assert(parsedComplex.data[0].Item === 'Widget, Standard', 'Commas inside quotes parsed without splitting');
  assert(parsedComplex.data[0].Notes === 'Includes "special" tag', 'Escaped double quotes "" parsed as "');
  assert(parsedComplex.data[0].Unicode === 'Zürich & Tokyo 富士山', 'Unicode accented characters and Kanji preserved');
  assert(parsedComplex.data[1].Notes === 'Multi-line\r\nDescription', 'Newline inside quoted field preserved');

  // 4. TSV and Semicolon Delimiters
  console.log('\nGroup 4: Delimiter Flexibility (TSV, Semicolon, Pipe)');
  const tsvData = `User\tEmail\tScore\nAlice\talice@example.com\t95\nBob\tbob@example.com\t88`;
  const parsedTsv = await parseDelimitedData(tsvData, { fileName: 'users.tsv' });
  assert(parsedTsv.delimiter === '\t', `Auto-detected tab delimiter (got "${parsedTsv.delimiter}")`);

  const semiData = `City;Country;Population\nParis;France;2161000\nBerlin;Germany;3645000`;
  const parsedSemi = await parseDelimitedData(semiData, { fileName: 'cities.csv' });
  assert(parsedSemi.delimiter === ';', `Auto-detected semicolon delimiter (got "${parsedSemi.delimiter}")`);

  // Explicit delimiter override test
  const pipeData = `Code|Status|Priority\nA1|Active|High\nB2|Pending|Medium`;
  const parsedPipe = await parseDelimitedData(pipeData, { delimiter: '|' });
  assert(parsedPipe.columnCount === 3, 'Explicit pipe delimiter parsed 3 columns');

  // 5. Identifier & Leading Zero Integrity
  console.log('\nGroup 5: Data Integrity (Leading Zeros & Identifiers)');
  const idData = `ID,ZipCode,Value\n00123,02138,100\n00456,07030,200`;
  const parsedId = await parseDelimitedData(idData, { fileName: 'ids.csv' });
  assert(parsedId.data[0].ID === '00123', `ID leading zeros preserved: got "${parsedId.data[0].ID}"`);
  assert(parsedId.data[0].ZipCode === '02138', `ZipCode leading zeros preserved: got "${parsedId.data[0].ZipCode}"`);

  // 6. Dataset Profiling & Statistics
  console.log('\nGroup 6: Dataset Profiling & Deep Statistics');
  const profile = generateDatasetProfile(parsed.data, parsed.columns, { fileName: 'superstore.csv' });
  assert(profile.rowCount === 50, 'Profile row count matches dataset');
  assert(profile.columnCount === 12, 'Profile column count matches dataset');
  assert(profile.duplicateRows === 0, 'Duplicate rows calculated correctly');
  assert(profile.healthScore >= 90, `Health score calculated: ${profile.healthScore}`);

  const salesCol = profile.columnProfiles.find((c) => c.name === 'Sales');
  assert(salesCol.type === 'numeric', 'Sales classified as numeric');
  assert(salesCol.stats.min < salesCol.stats.max, 'Sales min is strictly less than max');
  assert(salesCol.stats.mean > 0, `Sales mean computed: ${salesCol.stats.mean}`);
  assert(salesCol.stats.median > 0, `Sales median computed: ${salesCol.stats.median}`);
  assert(salesCol.stats.stdDev > 0, `Sales stdDev computed: ${salesCol.stats.stdDev}`);

  const dateCol = profile.columnProfiles.find((c) => c.name === 'Order_Date');
  assert(dateCol.type === 'date', 'Order_Date classified as date');
  assert(dateCol.dateStats.spanDays > 0, `Date span calculated: ${dateCol.dateStats.spanDays} days`);

  // 7. Filtering, Searching, Sorting & Date Operations
  console.log('\nGroup 7: Filtering, Searching & Sorting');
  // Global search
  const searched = filterDataset(parsed.data, parsed.columns, 'Corporate');
  assert(searched.length > 0 && searched.every((r) => Object.values(r).some((v) => String(v).includes('Corporate'))), 'Global search matches');

  // Numeric Greater Than
  const filteredQty = filterDataset(parsed.data, parsed.columns, '', [
    { column: 'Quantity', operator: 'greater_than', value: '4' },
  ]);
  assert(filteredQty.every((r) => Number(r.Quantity) > 4), 'greater_than operator accurate');

  // Date Filtering (between)
  const filteredDates = filterDataset(parsed.data, parsed.columns, '', [
    { column: 'Order_Date', operator: 'between', value: '2024-02-01', value2: '2024-03-31' },
  ]);
  assert(filteredDates.length > 0, `Date between filtered ${filteredDates.length} rows`);
  assert(
    filteredDates.every((r) => r.Order_Date >= '2024-02-01' && r.Order_Date <= '2024-03-31'),
    'Date between operator accurate'
  );

  // Is Empty operator
  const testEmptyData = [{ Val: 'A' }, { Val: '' }, { Val: 'B' }];
  const emptyFiltered = filterDataset(testEmptyData, ['Val'], '', [
    { column: 'Val', operator: 'is_empty' },
  ]);
  assert(emptyFiltered.length === 1 && emptyFiltered[0].Val === '', 'is_empty operator accurate');

  // Sorting
  const sortedSalesDesc = sortDataset(parsed.data, 'Sales', 'desc');
  assert(Number(sortedSalesDesc[0].Sales) >= Number(sortedSalesDesc[1].Sales), 'Numeric sort descending');

  const sortedSalesAsc = sortDataset(parsed.data, 'Sales', 'asc');
  assert(Number(sortedSalesAsc[0].Sales) <= Number(sortedSalesAsc[1].Sales), 'Numeric sort ascending');

  // Pagination
  const paginated = paginateDataset(parsed.data, 2, 15);
  assert(paginated.rows.length === 15, 'Page 2 contains 15 rows');
  assert(paginated.startIndex === 15, 'Page 2 start index is 15');
  assert(paginated.totalPages === 4, 'Total pages for 50 items @ 15/page is 4');

  // 8. Data Cleaning Operations
  console.log('\nGroup 8: Data Cleaning Studio Operations');
  // Duplicate rows removal
  const dataWithDupes = [...parsed.data, { ...parsed.data[0] }];
  const dedupedRows = removeDuplicateRows(dataWithDupes, parsed.columns);
  assert(dedupedRows.affectedRows === 1, 'Removed exactly 1 duplicate row');
  assert(dedupedRows.data.length === parsed.data.length, 'Length restored after deduplication');

  // Remove empty rows
  const dataWithEmptyRows = [{ A: '1', B: '2' }, { A: '', B: '' }, { A: '3', B: '4' }];
  const withoutEmptyRows = removeEmptyRows(dataWithEmptyRows, ['A', 'B']);
  assert(withoutEmptyRows.affectedRows === 1, 'Removed 1 empty row');
  assert(withoutEmptyRows.data.length === 2, '2 non-empty rows remaining');

  // Drop Columns & Schema Guard
  const dropAttempt = dropColumns(parsed.data, parsed.columns, parsed.columns); // Attempting to drop ALL columns
  assert(dropAttempt.affectedCols === 0, 'Blocked dropping all columns');

  const dropSome = dropColumns(parsed.data, parsed.columns, ['Product_Name', 'Payment_Method']);
  assert(dropSome.columns.length === parsed.columns.length - 2, 'Dropped 2 selected columns');
  assert(!dropSome.columns.includes('Product_Name'), 'Product_Name dropped from schema');

  // Column Reordering
  const reordered = reorderColumns(parsed.data, ['A', 'B', 'C'], ['C', 'A', 'B']);
  assert(reordered.columns[0] === 'C' && reordered.columns[1] === 'A', 'Reordered columns accurately');

  // Rename Column Collision Handling
  const renameRes = renameColumn(parsed.data, ['Name', 'Age'], 'Age', 'Name');
  assert(renameRes.columns.includes('Name_2'), 'Renaming to existing column name automatically appended _2');

  // Whitespace Trimming
  const spacedData = [{ Text: '   Hello World   ' }];
  const trimmedRes = trimWhitespace(spacedData, ['Text']);
  assert(trimmedRes.data[0].Text === 'Hello World', 'Whitespace trimmed');

  // Find & Replace
  const findRepRes = findAndReplace(parsed.data, parsed.columns, {
    column: 'Region',
    findValue: 'europe', // case-insensitive match
    replaceValue: 'European Union',
    matchType: 'exact',
  });
  assert(findRepRes.data.some((r) => r.Region === 'European Union'), 'Find and replace updated matched rows');

  // Fill Missing Values
  const missingRows = [{ Score: '10' }, { Score: '' }, { Score: '20' }];
  const filledMean = fillMissingValues(missingRows, ['Score'], {
    column: 'Score',
    strategy: 'mean',
  });
  assert(filledMean.data[1].Score === '15', `Filled missing value with mean: got "${filledMean.data[1].Score}"`);

  // Text Casing
  const caseData = [{ Title: 'hello world' }];
  const titled = changeTextCase(caseData, ['Title'], { column: 'Title', casing: 'Title Case' });
  assert(titled.data[0].Title === 'Hello World', 'Converted to Title Case');

  // Clean Numeric Strings (Currency, Accounting format, Percentages)
  const rawNumData = [
    { Price: '$1,299.99' },
    { Price: '($450.50)' }, // Negative accounting format
    { Price: '25%' },
  ];
  const cleanedNums = normalizeNumericStrings(rawNumData, ['Price'], { column: 'Price' });
  assert(cleanedNums.data[0].Price === '1299.99', `Cleaned $1,299.99 to 1299.99 (got ${cleanedNums.data[0].Price})`);
  assert(cleanedNums.data[1].Price === '-450.5', `Cleaned ($450.50) to -450.5 (got ${cleanedNums.data[1].Price})`);
  assert(cleanedNums.data[2].Price === '0.25', `Cleaned 25% to 0.25 (got ${cleanedNums.data[2].Price})`);

  // 9. CSV Export & Escaping Verification
  console.log('\nGroup 9: CSV Export & Escaping Verification');
  const exportData = [
    { Name: 'Smith, John', Quote: 'He said "Hello"', Multiline: 'Line 1\r\nLine 2', Accent: 'München' },
  ];
  const exportResult = exportToCsv(exportData, ['Name', 'Quote', 'Multiline', 'Accent'], 'test-export.csv');
  assert(exportResult.success === true, 'CSV export succeeded');
  assert(exportResult.csvString.includes('"Smith, John"'), 'Commas escaped with quotes in export');
  assert(exportResult.csvString.includes('"He said ""Hello"""'), 'Quotes escaped as double quotes in export');
  assert(exportResult.csvString.includes('München'), 'Unicode accents preserved in export string');

  // 10. Error Handling and Boundaries
  console.log('\nGroup 10: Boundaries & Error Handling');
  try {
    await parseDelimitedData('   ', { fileName: 'blank.csv' });
    assert(false, 'Should reject whitespace-only file');
  } catch (err) {
    assert(true, `Properly rejected blank file: ${err.message}`);
  }

  try {
    await parseDelimitedData('OnlyHeader\n', { fileName: 'no_rows.csv' });
    assert(false, 'Should reject dataset with 0 data rows');
  } catch (err) {
    assert(true, `Properly rejected dataset with no data rows: ${err.message}`);
  }

  // 11. Large Dataset & Streaming Parser Verification
  console.log('\nGroup 11: Large Dataset & Chunk Streaming Support');
  const largeRows = ['ID,Item,Amount,Category'];
  for (let i = 1; i <= 10000; i++) {
    largeRows.push(`${i},Item_${i % 50},${(i * 1.25).toFixed(2)},Cat_${i % 5}`);
  }
  const largeCsvString = largeRows.join('\n');

  let progressCalled = false;
  const largeParsed = await parseDelimitedData(largeCsvString, {
    fileName: 'large_dataset.csv',
    onProgress: (p) => {
      if (p.rowsLoaded > 0) progressCalled = true;
    },
  });

  assert(largeParsed.rowCount === 10000, `Parsed all 10,000 rows (got ${largeParsed.rowCount})`);
  assert(largeParsed.columns.length === 4, `Parsed 4 schema columns (got ${largeParsed.columns.length})`);
  assert(largeParsed.data[9999].ID === '10000', `Preserved 10,000th row data (ID: ${largeParsed.data[9999].ID})`);

  // Test row capping / truncation limit
  const cappedParsed = await parseDelimitedData(largeCsvString, {
    fileName: 'capped_dataset.csv',
    maxRows: 500,
  });
  assert(cappedParsed.rowCount === 500, `Successfully capped large dataset at 500 rows (got ${cappedParsed.rowCount})`);
  assert(cappedParsed.truncated === true, 'Flagged truncated state as true');

  console.log('\n=================================================');
  console.log(`QA & Stability Verification Complete: ${passedTests}/${totalTests} tests passed.`);
  console.log('=================================================');
}

runTests();
