import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

try {
  const filePath = resolve(__dirname, '../docs/PesachQuestionsAnswers.json');
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const questions = data.questions;

  console.log(`📦 Seeding ${questions.length} Pesach questions...`);

  for (const q of questions) {
    await sql`
      INSERT INTO questions (id, theme, topic, difficulty, question, answers, correct_answer_id, time_limit_sec, explanation, tags)
      VALUES (
        ${q.id}, 'pesach', ${q.topic}, ${q.difficulty}, ${q.question},
        ${JSON.stringify(q.answers)}, ${q.correctAnswerId}, ${q.timeLimitSec},
        ${q.explanation}, ${JSON.stringify(q.tags)}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const result = await sql`SELECT COUNT(*) FROM questions WHERE theme = 'pesach'`;
  console.log(`✅ Done! Pesach questions in prod: ${result[0].count}`);
  await sql.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  await sql.end();
  process.exit(1);
}
