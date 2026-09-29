const { Client } = require('pg');

async function testConnection() {
  const connectionString = 'postgresql://postgres.rfxrotmexttiixralibg:Sudheer%40123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000
  });

  try {
    console.log('Connecting to 5432...');
    await client.connect();
    console.log('Successfully connected to 5432');
    await client.end();
  } catch (err) {
    console.error('Connection error on 5432', err.message);
  }
}

testConnection();
