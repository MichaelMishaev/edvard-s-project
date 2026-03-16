import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.log('Run this script with: railway run node server/run-prod-migration-0002.mjs');
  process.exit(1);
}

console.log('📦 Connecting to Railway production database...');
const sql = postgres(DATABASE_URL);

try {
  console.log('\n📝 Running migration 0002: add theme column to questions...\n');

  await sql`ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "theme" varchar(20) DEFAULT 'jerusalem' NOT NULL`;

  console.log('✅ Migration 0002 applied successfully!');
  console.log('\nChanges:');
  console.log('  - Added "theme" column to questions table (default: jerusalem)');
  console.log('  - All existing questions now have theme = jerusalem');

  await sql.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  await sql.end();
  process.exit(1);
}
