const knex = require('knex');
const config = require('./packages/server/knexfile.ts').default;
const db = knex(config.development);

async function check() {
  const today = new Date().toISOString().split('T')[0];
  console.log('Checking for date:', today);
  
  const logs = await db('daily_logs').where({ date: today });
  console.log('Daily Logs:', logs.length);
  
  const summaries = await db('day_summaries').where({ date: today });
  console.log('Day Summaries:', summaries.length);
  
  const identities = await db('identities').select('name', 'xp');
  console.log('Identities:', identities);
  
  process.exit(0);
}

check();
