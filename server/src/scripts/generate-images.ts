import { db } from "../db/index.js";
import { questions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateQuestionImage } from "../services/ideogram.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

const OUTPUT_DIR = resolve(
  import.meta.dirname,
  "../../../client/public/images/questions"
);

async function downloadImage(url: string, filePath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(filePath, buffer);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateImages() {
  console.log("Generating images for all questions...");

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allQuestions = await db.select().from(questions);
  console.log(`Found ${allQuestions.length} questions.`);

  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    const filePath = resolve(OUTPUT_DIR, `${q.id}.png`);

    if (existsSync(filePath)) {
      console.log(`[${i + 1}/${allQuestions.length}] Skipping ${q.id} (already exists)`);
      continue;
    }

    try {
      console.log(
        `[${i + 1}/${allQuestions.length}] Generating image for ${q.id}: ${q.question.substring(0, 50)}...`
      );

      const imageUrl = await generateQuestionImage(q.question, q.topic);
      await downloadImage(imageUrl, filePath);

      // Update DB with relative image path
      const relativePath = `/images/questions/${q.id}.png`;
      await db
        .update(questions)
        .set({ imageUrl: relativePath })
        .where(eq(questions.id, q.id));

      console.log(`  Saved to ${filePath}`);

      // Rate limiting: wait 2 seconds between requests
      if (i < allQuestions.length - 1) {
        await sleep(2000);
      }
    } catch (error) {
      console.error(`  Error generating image for ${q.id}:`, error);
    }
  }

  console.log("Image generation complete.");
  process.exit(0);
}

generateImages().catch((err) => {
  console.error("Image generation failed:", err);
  process.exit(1);
});
