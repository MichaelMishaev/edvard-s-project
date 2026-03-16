import postgres from 'postgres';
import { TZDate } from '@date-fns/tz';
import { startOfWeek, addDays, setHours, setMinutes, setSeconds, getWeek } from 'date-fns';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const ISRAEL_TZ = 'Asia/Jerusalem';
const sql = postgres(DATABASE_URL);

// Get next Sunday at 00:00 Israel time
function getNextSunday() {
  const now = new TZDate(Date.now(), ISRAEL_TZ);
  let nextSunday = startOfWeek(now, { weekStartsOn: 0 }); // Sunday = 0

  // If it's already Sunday, move to next week
  if (nextSunday.getTime() <= now.getTime()) {
    nextSunday = addDays(nextSunday, 7);
  }

  // Set to 00:00:00
  return setSeconds(setMinutes(setHours(nextSunday, 0), 0), 0);
}

// Get Friday at 12:00 for the given Sunday
function getFridayFromSunday(sunday) {
  const friday = addDays(sunday, 5); // Sunday + 5 = Friday
  return setSeconds(setMinutes(setHours(friday, 12), 0), 0);
}

try {
  console.log('📅 Creating weekly contest...\n');

  const startDate = getNextSunday();
  const endDate = getFridayFromSunday(startDate);
  const weekNumber = getWeek(startDate);

  const [contest] = await sql`
    INSERT INTO contests (week_number, start_date, end_date, status, min_participants, total_participants)
    VALUES (${weekNumber}, ${startDate}, ${endDate}, 'active', 10, 0)
    RETURNING *
  `;

  console.log('✅ Contest created successfully!\n');
  console.log(`Week Number: ${contest.week_number}`);
  console.log(`Start: ${new Date(contest.start_date).toLocaleString('he-IL', { timeZone: ISRAEL_TZ })}`);
  console.log(`End: ${new Date(contest.end_date).toLocaleString('he-IL', { timeZone: ISRAEL_TZ })}`);
  console.log(`Status: ${contest.status}`);
  console.log(`Min Participants: ${contest.min_participants}`);

  await sql.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Error creating contest:', error.message);
  await sql.end();
  process.exit(1);
}
