const knex = require('knex');
const config = require('./packages/server/knexfile.js');
const db = knex(config.development);

async function dump() {
    try {
        const users = await db('users').select('id', 'email', 'name', 'password');
        console.log('--- USER DUMP ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}`);
            console.log(`Email: [${u.email}]`);
            console.log(`Name: ${u.name}`);
            console.log(`Password: [${u.password}]`);
            console.log('---');
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

dump();
