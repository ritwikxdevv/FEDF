/**
 * reset-admin.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Run this ONCE to delete the old admin account that was seeded with a
 * plaintext password (bypassing bcrypt). The server will automatically
 * re-create it with a properly bcrypt-hashed password on next start.
 *
 * Usage:
 *   node backend/scripts/reset-admin.js
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User     = require('../src/models/User');

async function main() {
  console.log('[reset-admin] Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[reset-admin] Connected.');

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('[reset-admin] ADMIN_EMAIL not set in .env — aborting.');
    process.exit(1);
  }

  const result = await User.deleteOne({ email: adminEmail });

  if (result.deletedCount > 0) {
    console.log(`[reset-admin] ✓ Deleted old admin account for: ${adminEmail}`);
    console.log('[reset-admin] Restart the backend server — it will re-create the admin with a hashed password.');
  } else {
    console.log(`[reset-admin] No admin account found for: ${adminEmail} (nothing to delete).`);
  }

  await mongoose.disconnect();
  console.log('[reset-admin] Done.');
}

main().catch(err => {
  console.error('[reset-admin] Error:', err.message);
  process.exit(1);
});
