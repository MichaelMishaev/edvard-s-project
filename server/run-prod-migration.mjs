import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.log('Run this script with: railway run node run-prod-migration.mjs');
  process.exit(1);
}

console.log('📦 Connecting to Railway production database...');
const sql = postgres(DATABASE_URL);

try {
  // Read the migration SQL file
  const migrationPath = join(__dirname, 'drizzle/0001_empty_eddie_brock.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('\n📝 Running contest table migration...\n');

  // Execute the entire migration as one transaction
  await sql.unsafe(migrationSQL);

  console.log('✅ Contest tables created successfully!');
  console.log('\nCreated tables:');
  console.log('  - contests');
  console.log('  - contest_participants');
  console.log('  - hall_of_fame');
  console.log('\nAdded to players table:');
  console.log('  - class_name column');
  console.log('  - contest_badges column');

  await sql.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error.message);

  if (error.message.includes('already exists')) {
    console.log('\n💡 Tables already exist - migration not needed!');
    await sql.end();
    process.exit(0);
  }

  await sql.end();
  process.exit(1);
}
