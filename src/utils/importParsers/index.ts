// One-time data-migration parsers: turn STC spreadsheets (census workbooks,
// contact sheets, diagnosis lists, generic CSVs) into typed records the app
// can import. Pure functions — no React, no side effects.
export * from './types';
export * from './censusCsv';
export * from './censusXlsx';
export * from './contactSheet';
export * from './dxXlsx';
export * from './matchClient';
