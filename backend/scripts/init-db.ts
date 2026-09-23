import dotenv from 'dotenv';
import { pool, testConnection, initializeDatabase } from '../src/config/database.js';

dotenv.config();

async function initDb() {
  console.log('🔧 Initializing Delivery Manager Database...\n');

  try {
    console.log('1️⃣  Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('\n❌ Failed to connect to database');
      console.error('Please check your database configuration in .env.local');
      process.exit(1);
    }

    console.log('\n2️⃣  Creating database schema...');
    await initializeDatabase();

    console.log('\n3️⃣  Verifying tables...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('✓ Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend: npm run dev');
    console.log('   2. Test the API: curl http://localhost:5000/health');
    console.log('   3. Update frontend service to use: http://localhost:5000/api');

  } catch (error) {
    console.error('\n❌ Error during initialization:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
