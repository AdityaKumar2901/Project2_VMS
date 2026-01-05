const { dbAll, saveDatabase } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Initialize database with schema and seed data
const initializeDatabaseWithData = async () => {
  try {
    console.log('🔄 Initializing SQLite database...');
    
    const dbConfig = require('../config/db');
    const db = dbConfig.db();

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../../database/schema.sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute each statement
    const statements = schema.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        db.run(stmt.trim());
      }
    }
    console.log('✅ Schema created successfully');

    // Read and execute seed data
    const seedPath = path.join(__dirname, '../../../database/seed.sqlite.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    const seedStatements = seed.split(';').filter(s => s.trim());
    for (const stmt of seedStatements) {
      if (stmt.trim()) {
        db.run(stmt.trim());
      }
    }
    console.log('✅ Seed data inserted successfully');
    
    // Save to file
    saveDatabase();
    console.log('✅ Database initialization complete!');
    
    // Show some stats
    const userCount = await dbAll('SELECT COUNT(*) as count FROM users');
    const productCount = await dbAll('SELECT COUNT(*) as count FROM products');
    const vendorCount = await dbAll('SELECT COUNT(*) as count FROM vendor_profiles');
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Vendors: ${vendorCount[0].count}`);
    console.log(`   Products: ${productCount[0].count}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

// Check if database needs initialization
const checkDatabase = async () => {
  try {
    // Check if both tables and view exist
    const tables = await dbAll(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    );
    
    const views = await dbAll(
      "SELECT name FROM sqlite_master WHERE type='view' AND name='vendor_stats_view'"
    );
    
    // Check if revoked column exists in refresh_tokens
    let hasRevokedColumn = false;
    try {
      await dbAll("SELECT revoked FROM refresh_tokens LIMIT 1");
      hasRevokedColumn = true;
    } catch (e) {
      hasRevokedColumn = false;
    }
    
    if (tables.length === 0 || views.length === 0 || !hasRevokedColumn) {
      console.log('📦 Database needs initialization...\n');
      await initializeDatabaseWithData();
    } else {
      console.log('✅ Database already initialized\n');
    }
  } catch (error) {
    console.error('Error checking database:', error.message);
    // If error, try to initialize
    await initializeDatabaseWithData();
  }
};

module.exports = { initializeDatabase: initializeDatabaseWithData, checkDatabase };
