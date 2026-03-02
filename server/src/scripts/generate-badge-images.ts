import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const API_KEY = process.env.IDEOGRAM_API_KEY;
const OUTPUT_DIR = path.resolve(
  __dirname,
  "../../../client/public/images/badges"
);

interface BadgePrompt {
  id: string;
  prompt: string;
}

const BADGE_PROMPTS: BadgePrompt[] = [
  {
    id: "participation-hero",
    prompt:
      "A children's book illustration of a golden trophy cup with a checkmark on it, sitting on a red velvet pillow, Jerusalem old city walls in the background, warm golden light, round medal badge design, simple and colorful for kids",
  },
  {
    id: "smart-explorer",
    prompt:
      "A children's book illustration of a golden compass with a magnifying glass, ancient Jerusalem map in the background, adventure theme, round medal badge design, simple and colorful for kids",
  },
  {
    id: "jerusalem-expert",
    prompt:
      "A children's book illustration of a golden crown with the Star of David on top, Jerusalem skyline with the Dome of the Rock, laurel wreath frame, round medal badge design, regal and colorful for kids",
  },
  {
    id: "fast-thinker",
    prompt:
      "A children's book illustration of a golden lightning bolt striking through an hourglass, sparks and speed lines, Jerusalem stone texture background, round medal badge design, dynamic and colorful for kids",
  },
  {
    id: "history-star",
    prompt:
      "A children's book illustration of a glowing golden star on top of an ancient scroll, Jerusalem historical stone ruins, round medal badge design, warm tones, simple and colorful for kids",
  },
  {
    id: "magen-david",
    prompt:
      "A children's book illustration of a large golden Shield of David (Star of David) emblem on a dark blue shield with gold trim, Jerusalem stone wall background, round medal badge design, regal and colorful for kids",
  },
  {
    id: "lions-gate",
    prompt:
      "A children's book illustration of a majestic golden lion face carved in stone, the Lions Gate of Jerusalem old city, ancient stone arch, round medal badge design, warm golden tones for kids",
  },
  {
    id: "golden-menorah",
    prompt:
      "A children's book illustration of a golden seven-branched menorah glowing with warm light, dark green background with gold ornaments, Jerusalem Temple theme, round medal badge design, colorful for kids",
  },
  {
    id: "jerusalem-walls",
    prompt:
      "A children's book illustration of the ancient stone walls of Jerusalem with towers, golden light at sunset, birds flying overhead, round medal badge design, warm tones for kids",
  },
  {
    id: "olive-branch",
    prompt:
      "A children's book illustration of a green olive branch with golden olives, dove of peace flying, Jerusalem skyline in the background, round medal badge design, peaceful and colorful for kids",
  },
  {
    id: "davids-harp",
    prompt:
      "A children's book illustration of King David's golden harp with musical notes floating around it, purple and gold royal theme, Jerusalem palace background, round medal badge design, elegant and colorful for kids",
  },
  {
    id: "royal-crown",
    prompt:
      "A children's book illustration of a magnificent golden royal crown with jewels, sitting on a red pillow with stars around it, Jerusalem cityscape, round medal badge design, sparkling and colorful for kids",
  },
];

async function generateBadgeImage(badge: BadgePrompt): Promise<void> {
  const outputPath = path.join(OUTPUT_DIR, `${badge.id}.png`);

  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`[SKIP] ${badge.id} - already exists`);
    return;
  }

  console.log(`[GEN] ${badge.id} - generating...`);

  const formData = new FormData();
  formData.append("prompt", badge.prompt);
  formData.append("rendering_speed", "TURBO");
  formData.append("style_type", "AUTO");
  formData.append("resolution", "1024x1024");
  formData.append("num_images", "1");

  const response = await fetch(
    "https://api.ideogram.ai/v1/ideogram-v3/generate",
    {
      method: "POST",
      headers: { "Api-Key": API_KEY! },
      body: formData,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`[ERR] ${badge.id} - ${response.status}: ${text}`);
    return;
  }

  const json = (await response.json()) as {
    data: { url: string }[];
  };

  if (!json.data?.[0]?.url) {
    console.error(`[ERR] ${badge.id} - no image URL in response`);
    return;
  }

  const imageUrl = json.data[0].url;
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    console.error(`[ERR] ${badge.id} - failed to download image`);
    return;
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`[OK] ${badge.id} - saved to ${outputPath}`);
}

async function main() {
  if (!API_KEY) {
    console.error("IDEOGRAM_API_KEY not set in .env");
    process.exit(1);
  }

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Generating ${BADGE_PROMPTS.length} badge images...`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Generate sequentially to avoid rate limits
  for (const badge of BADGE_PROMPTS) {
    try {
      await generateBadgeImage(badge);
      // Small delay between requests
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`[ERR] ${badge.id} - ${err}`);
    }
  }

  console.log("\nDone!");
}

main();
