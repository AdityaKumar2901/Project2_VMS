const { dbGet } = require('./src/config/db');

async function testDbGet() {
  try {
    console.log('Testing dbGet function...\n');
    
    const user = await dbGet(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      ['john.customer@email.com']
    );
    
    console.log('Result from dbGet:', JSON.stringify(user, null, 2));
    console.log('\nPassword hash exists:', user?.password_hash ? 'Yes' : 'No');
    console.log('Password hash value:', user?.password_hash);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDbGet();
