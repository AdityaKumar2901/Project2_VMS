const initSqlJs = require('sql.js');
const fs = require('fs');

async function checkDatabase() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync('./data/marketplace.db');
  const db = new SQL.Database(buffer);
  
  const result = db.exec('SELECT email, password_hash FROM users WHERE email = "john.customer@email.com"');
  
  console.log('Query Result:', JSON.stringify(result, null, 2));
  
  if (result.length > 0 && result[0].values.length > 0) {
    const [email, passwordHash] = result[0].values[0];
    console.log('\nEmail:', email);
    console.log('Password Hash:', passwordHash);
    console.log('Hash Length:', passwordHash ? passwordHash.length : 0);
  } else {
    console.log('No user found!');
  }
}

checkDatabase().catch(console.error);
