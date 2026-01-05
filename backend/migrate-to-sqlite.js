#!/usr/bin/env node

/**
 * SQLite Migration Script
 * This script converts all MySQL pool queries to SQLite queries
 * Run with: node migrate-to-sqlite.js
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src/controllers');

// Patterns to replace
const replacements = [
  // Import statement
  {
    from: /const \{ pool \} = require\('\.\.\/config\/db'\);/g,
    to: "const { dbRun, dbGet, dbAll } = require('../config/db');"
  },
  // pool.query with destructured array - SELECT
  {
    from: /const \[(\w+)\] = await pool\.query\(/g,
    to: 'const $1 = await dbAll('
  },
  // pool.query with destructured array - INSERT/UPDATE/DELETE
  {
    from: /const \[result\] = await pool\.query\(/g,
    to: 'const result = await dbRun('
  },
  // Direct pool.query calls (await pool.query)
  {
    from: /await pool\.query\(/g,
    to: 'await dbRun('
  },
  // result.insertId to result.lastID
  {
    from: /result\.insertId/g,
    to: 'result.lastID'
  },
  // Check array length > 0
  {
    from: /(\w+)\.length === 0/g,
    to: '!$1'
  },
  {
    from: /(\w+)\.length > 0/g,
    to: '$1'
  },
  // Array access [0] for single results
  {
    from: /const (\w+) = (\w+)\[0\];/g,
    to: 'const $1 = $2;'
  },
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ from, to }) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrated: ${path.basename(filePath)}`);
    return true;
  }
  
  console.log(`⏭️  Skipped: ${path.basename(filePath)} (no changes needed)`);
  return false;
}

// Get all controller files
const files = fs.readdirSync(controllersDir)
  .filter(file => file.endsWith('.controller.js'))
  .map(file => path.join(controllersDir, file));

console.log('🔄 Starting SQLite migration...\n');

let migratedCount = 0;
files.forEach(file => {
  if (migrateFile(file)) {
    migratedCount++;
  }
});

console.log(`\n✨ Migration complete! ${migratedCount}/${files.length} files updated.`);
console.log('\n⚠️  Manual review recommended for:');
console.log('   - Complex queries with multiple result sets');
console.log('   - LIMIT/OFFSET queries');
console.log('   - Date handling (use .toISOString() for SQLite)');
console.log('   - Boolean values (use 0/1 instead of TRUE/FALSE)');
