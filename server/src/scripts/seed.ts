import { db } from "../db/index.js";
import { questions } from "../db/schema.js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

type QuestionData = {
  questions: Array<{
    id: string;
    topic: string;
    difficulty: number;
    question: string;
    answers: { id: string; text: string }[];
    correctAnswerId: string;
    timeLimitSec: number;
    explanation: string;
    tags: string[];
  }>;
};

async function seedFile(filePath: string, theme: "jerusalem" | "pesach") {
  if (!existsSync(filePath)) {
    console.log(`Skipping ${theme} questions (file not found: ${filePath})`);
    return 0;
  }
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as QuestionData;

  for (const q of data.questions) {
    await db
      .insert(questions)
      .values({
        id: q.id,
        theme,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        answers: q.answers,
        correctAnswerId: q.correctAnswerId,
        timeLimitSec: q.timeLimitSec,
        explanation: q.explanation,
        tags: q.tags,
      })
      .onConflictDoNothing({ target: questions.id });
  }
  return data.questions.length;
}

async function seed() {
  console.log("Seeding questions...");

  const jerusalemPath = resolve(import.meta.dirname, "../../../docs/Questionsanswers.json");
  const pesachPath = resolve(import.meta.dirname, "../../../docs/PesachQuestionsAnswers.json");

  const jerusalemCount = await seedFile(jerusalemPath, "jerusalem");
  console.log(`Seeded ${jerusalemCount} Jerusalem questions.`);

  const pesachCount = await seedFile(pesachPath, "pesach");
  console.log(`Seeded ${pesachCount} Pesach questions.`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
