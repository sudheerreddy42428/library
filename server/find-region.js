const { Client } = require('pg');

const regions = [
  'ap-northeast-1', 'ap-northeast-2', 'ap-south-1', 'ap-southeast-1', 'ap-southeast-2',
  'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'sa-east-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2'
];

async function findRegion() {
  console.log('Searching for the correct Supabase region...');
  
  for (const region of regions) {
    const connectionString = `postgresql://postgres.rfxrotmexttiixralibg:Sudheer%40123@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    
    const client = new Client({
      connectionString,
      connectionTimeoutMillis: 3000 // 3 seconds timeout
    });

    try {
      await client.connect();
      console.log(`\nSUCCESS! Region found: ${region}`);
      console.log(`Connection String: ${connectionString}`);
      await client.end();
      process.exit(0);
    } catch (err) {
      process.stdout.write('.'); // Print dot for failure
    }
  }
  console.log('\nCould not find region or connection failed for all.');
}

findRegion();
