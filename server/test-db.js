const { Client } = require('pg');

async function testConnection() {
  const connectionString = 'postgresql://postgres:Sudheer@123@db.rfxrotmexttiixralibg.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Successfully connected to database');
    const res = await client.query('SELECT NOW()');
    console.log('Current time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error', err.stack);
  }
}

testConnection();
