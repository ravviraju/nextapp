/**
 * Script to create an admin user in MongoDB
 * Usage: node --experimental-modules scripts/create-admin.js <email> <password>
 * Example: node --experimental-modules scripts/create-admin.js admin@example.com mypassword123
 * 
 * Or rename this file to create-admin.mjs and run:
 * node scripts/create-admin.mjs <email> <password>
 */

import { createAdminUser } from '../lib/models/User.js';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

async function main() {
  try {
    console.log('Creating admin user...');
    const userId = await createAdminUser(email, password);
    console.log(`Admin user created successfully with ID: ${userId}`);
    console.log(`Email: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

main();
