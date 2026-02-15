
const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'packages/server/dev.sqlite3')
    },
    useNullAsDefault: true
});

async function main() {
    const email = 'emilcastle2608@gmail.com';
    const password = 'emi123';

    console.log(`Checking for user: ${email}`);

    const user = await db('users').where('email', email).first();

    if (user) {
        console.log('User found. Updating password...');
        await db('users').where('email', email).update({ password });
        console.log('Password updated.');
    } else {
        console.log('User not found. Creating user...');
        await db('users').insert({
            id: crypto.randomUUID(),
            email,
            password,
            name: 'Emiliano'
        });
        console.log('User created.');
    }

    process.exit(0);
}

// Minimal crypto shim for uuid if needed in node < 19 (though standard now)
const crypto = require('crypto');

main().catch(console.error);
