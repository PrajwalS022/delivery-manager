import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

async function testConnection() {
  console.log('🧪 Testing Database Connection\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'delivery_manager',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  };

  console.log('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  User: ${config.user}`);
  console.log('');

  try {
    const pool = new Pool(config);
    
    console.log('⏳ Connecting to database...');
    const result = await pool.query('SELECT NOW() as current_time, version()');
    
    console.log('✅ Connection successful!\n');
    console.log('Server time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].version);
    
    await pool.end();
  } catch (error: any) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Suggestions:');
      console.error('   - Is PostgreSQL running?');
      console.error('   - Check DB_HOST and DB_PORT in .env.local');
      console.error('   - On Windows, start PostgreSQL from Services');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Suggestions:');
      console.error('   - Check DB_HOST is correct');
      console.error('   - Check internet connection for cloud databases');
    } else if (error.code === '28P01') {
      console.error('\n💡 Suggestions:');
      console.error('   - Check DB_USER and DB_PASSWORD');
    } else if (error.code === '3D000') {
      console.error('\n💡 Suggestions:');
      console.error('   - Database does not exist');
      console.error('   - Run: npm run migrate');
    }
    
    process.exit(1);
  }
}

testConnection();
