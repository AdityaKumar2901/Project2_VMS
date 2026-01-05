const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'marketplace.db');

let db;
let SQL;

// Initialize database
const initDatabase = async () => {
  SQL = await initSqlJs();
  
  // Load existing database if it exists
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ Loaded existing SQLite database:', dbPath);
  } else {
    // Create new database
    db = new SQL.Database();
    console.log('✅ Created new SQLite database:', dbPath);
  }
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  return db;
};

// Save database to file
const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// Auto-save periodically
setInterval(() => {
  saveDatabase();
}, 30000); // Save every 30 seconds

// Sanitize parameters - convert Date objects to ISO strings
const sanitizeParams = (params) => {
  return params.map(p => {
    if (p instanceof Date) {
      return p.toISOString();
    }
    return p;
  });
};

// Wrapper functions with async interface
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      db.run(sql, sanitizeParams(params));
      const result = db.exec('SELECT last_insert_rowid() as lastID, changes() as changes');
      const lastID = result[0]?.values[0]?.[0] || 0;
      const changes = result[0]?.values[0]?.[1] || 0;
      saveDatabase();
      resolve({ lastID, changes });
    } catch (err) {
      reject(err);
    }
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      stmt.bind(sanitizeParams(params));
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        resolve(row);
      } else {
        stmt.free();
        resolve(undefined);
      }
    } catch (err) {
      reject(err);
    }
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      stmt.bind(sanitizeParams(params));
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      resolve(results);
    } catch (err) {
      reject(err);
    }
  });
};

// Test database connection
const testConnection = async () => {
  try {
    if (!db) {
      await initDatabase();
    }
    await dbGet('SELECT 1 as test');
    console.log('✅ SQLite database connection verified');
    return true;
  } catch (error) {
    console.error('❌ SQLite connection test failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  saveDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveDatabase();
  process.exit(0);
});

module.exports = { db: () => db, dbRun, dbGet, dbAll, testConnection, initDatabase, saveDatabase };
