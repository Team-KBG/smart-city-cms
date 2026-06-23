/**
 * migrateLegacyPasswords.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE-TIME migration script.
 *
 * Purpose:
 *   Find every Citizen document whose `password` field is missing, null,
 *   or an empty string, generate a unique temporary password for each one,
 *   bcrypt-hash it, and persist the hash.  Valid users (those who already
 *   have a hash) are never touched.
 *
 * Usage:
 *   node scripts/migrateLegacyPasswords.js
 *
 * Run from the /backend directory so that .env is picked up automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path   = require('path');
const crypto = require('crypto');

// Load .env from the backend root (one level up from /scripts)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Inline schema ─────────────────────────────────────────────────────────────
// We define a minimal schema here so the script stays self-contained and
// does NOT rely on the application-level Citizen model (which may enforce
// validators that would reject null passwords).
const citizenSchema = new mongoose.Schema(
  {
    email:    { type: String },
    password: { type: String, default: undefined },
    name:     { type: String },
    role:     { type: String },
    isActive: { type: Boolean },
  },
  { strict: false, timestamps: true }
);

const Citizen = mongoose.model('Citizen', citizenSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a human-readable temporary password:
 *   Tmp-<6 random hex chars>-<4 random hex chars>
 *   e.g.  Tmp-a3f9c1-b82d
 */
function generateTempPassword() {
  const part1 = crypto.randomBytes(3).toString('hex'); // 6 chars
  const part2 = crypto.randomBytes(2).toString('hex'); // 4 chars
  return `Tmp-${part1}-${part2}`;
}

/** Left-pad a string to `width` chars for table alignment. */
const pad = (str, width) => String(str).padEnd(width, ' ');

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌  MONGO_URI is not set. Make sure .env exists in /backend.');
    process.exit(1);
  }

  console.log('\n🔗  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10_000 });
  console.log('✅  Connected.\n');

  // ── 1. Find legacy citizens ─────────────────────────────────────────────────
  const legacyCitizens = await Citizen.find({
    $or: [
      { password: { $exists: false } },
      { password: null },
      { password: '' },
    ],
  }).select('_id email name role isActive');

  if (legacyCitizens.length === 0) {
    console.log('✅  No legacy Citizens found — every record already has a password hash.');
    console.log('    Nothing was modified.\n');
    await mongoose.disconnect();
    return;
  }

  console.log(`⚠️   Found ${legacyCitizens.length} Citizen(s) without a password hash.\n`);

  // ── 2. Generate, hash, and update each legacy citizen ──────────────────────
  const SALT_ROUNDS = 12;
  const results = []; // { email, name, role, tempPassword, updated }

  for (const citizen of legacyCitizens) {
    const tempPassword = generateTempPassword();

    let updated = false;
    try {
      const hash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

      // Use updateOne with $set so we bypass any model-level validators
      await Citizen.updateOne(
        { _id: citizen._id },
        { $set: { password: hash } }
      );
      updated = true;
    } catch (err) {
      console.error(`  ❌  Failed to update ${citizen.email}: ${err.message}`);
    }

    results.push({
      email:        citizen.email        || '(no email)',
      name:         citizen.name         || '(no name)',
      role:         citizen.role         || 'citizen',
      isActive:     citizen.isActive !== false ? 'yes' : 'no',
      tempPassword: updated ? tempPassword : 'UPDATE FAILED',
      updated,
    });
  }

  // ── 3. Print results table ──────────────────────────────────────────────────
  const COL = { email: 40, name: 20, role: 18, active: 8, pass: 18 };
  const divider = '─'.repeat(COL.email + COL.name + COL.role + COL.active + COL.pass + 14);

  console.log('\n' + divider);
  console.log(
    `  ${pad('EMAIL', COL.email)}${pad('NAME', COL.name)}` +
    `${pad('ROLE', COL.role)}${pad('ACTIVE', COL.active)}TEMP PASSWORD`
  );
  console.log(divider);

  for (const r of results) {
    const status = r.updated ? '✅' : '❌';
    console.log(
      `${status} ${pad(r.email, COL.email)}${pad(r.name, COL.name)}` +
      `${pad(r.role, COL.role)}${pad(r.isActive, COL.active)}${r.tempPassword}`
    );
  }

  console.log(divider);
  console.log(
    `\n  Total processed : ${results.length}` +
    `  |  Updated : ${results.filter(r => r.updated).length}` +
    `  |  Failed  : ${results.filter(r => !r.updated).length}\n`
  );

  console.log('📋  IMPORTANT — share these temporary passwords securely with affected users.');
  console.log('    They should change their passwords immediately after first login.\n');

  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB.\n');
}

run().catch((err) => {
  console.error('\n❌  Unexpected error:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
