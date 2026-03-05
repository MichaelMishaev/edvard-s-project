import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

try {
  // Check if contests table exists and get contest data
  const contests = await sql`
    SELECT
      id,
      week_number,
      status,
      start_date,
      end_date,
      total_participants,
      created_at
    FROM contests
    ORDER BY created_at DESC
    LIMIT 5
  `;

  console.log('\n📊 Production Contests (Latest 5):');
  console.log('=====================================\n');

  if (contests.length === 0) {
    console.log('❌ No contests found in production database');
    console.log('\n⚠️  Cron jobs might not be running or haven\'t created contests yet');
  } else {
    contests.forEach((c, i) => {
      console.log(`${i + 1}. Week ${c.week_number} (${c.status})`);
      console.log(`   Start: ${c.start_date}`);
      console.log(`   End: ${c.end_date}`);
      console.log(`   Participants: ${c.total_participants}`);
      console.log(`   Created: ${c.created_at}`);
      console.log('');
    });

    // Check for active contests
    const activeContests = contests.filter(c => c.status === 'active');
    if (activeContests.length > 0) {
      console.log('✅ Active contest found!');
    } else {
      console.log('⚠️  No active contests currently');
    }
  }

  // Check cron job initialization by looking at logs
  console.log('\n💡 To verify cron jobs are running:');
  console.log('   1. Check Railway logs for "[Cron] Contest jobs initialized"');
  console.log('   2. Wait until next Sunday 00:00 Israel time');
  console.log('   3. Check logs for "[Cron] Creating weekly contest..."');

  await sql.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Error querying database:', error.message);
  await sql.end();
  process.exit(1);
}
