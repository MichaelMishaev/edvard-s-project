import "dotenv/config";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

const IDEOGRAM_API_URL = "https://api.ideogram.ai/v1/ideogram-v3/generate";
const OUTPUT_DIR = resolve(
  import.meta.dirname,
  "../../../client/public/images/ui"
);

interface ImageRequest {
  name: string;
  prompt: string;
  aspectRatio: string;
  style: string;
}

const UI_IMAGES: ImageRequest[] = [
  {
    name: "jerusalem-hero",
    prompt:
      "A stunning panoramic view of Jerusalem's Old City at golden hour, showing the Western Wall, Dome of the Rock, and ancient stone buildings. Warm golden sunlight, blue sky with soft clouds. Children's book illustration style, friendly and inviting, bright colors. No text.",
    aspectRatio: "16x9",
    style: "CHILDRENS_BOOK",
  },
  {
    name: "jerusalem-countdown",
    prompt:
      "A beautiful aerial view of Jerusalem showing the Old City walls, ancient streets, and the golden Dome of the Rock. Illustrated in a colorful children's book style with warm tones. Friendly educational atmosphere for kids. No text.",
    aspectRatio: "16x9",
    style: "CHILDRENS_BOOK",
  },
  {
    name: "jerusalem-map-bg",
    prompt:
      "An illustrated treasure map of Jerusalem for children, showing landmarks like the Western Wall, Tower of David, and ancient gates. Warm parchment colors with colorful illustrated landmarks. Adventure game style, fun and educational. No text or labels.",
    aspectRatio: "9x16",
    style: "CHILDRENS_BOOK",
  },
];

async function generateImage(req: ImageRequest): Promise<string> {
  const apiKey = process.env.IDEOGRAM_API_KEY;
  if (!apiKey) throw new Error("IDEOGRAM_API_KEY not set");

  const formData = new FormData();
  formData.append("prompt", req.prompt);
  formData.append("rendering_speed", "TURBO");
  formData.append("aspect_ratio", req.aspectRatio);
  formData.append("style_preset", req.style);

  const response = await fetch(IDEOGRAM_API_URL, {
    method: "POST",
    headers: { "Api-Key": apiKey },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ideogram API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { data?: { url?: string }[] };
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) throw new Error("No image URL returned");
  return imageUrl;
}

async function downloadImage(url: string, filePath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(filePath, buffer);
}

async function main() {
  console.log("Generating UI images for Jerusalem Quest...");

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const req of UI_IMAGES) {
    const filePath = resolve(OUTPUT_DIR, `${req.name}.png`);

    if (existsSync(filePath)) {
      console.log(`Skipping ${req.name} (already exists)`);
      continue;
    }

    try {
      console.log(`Generating ${req.name}...`);
      const imageUrl = await generateImage(req);
      await downloadImage(imageUrl, filePath);
      console.log(`  Saved: ${filePath}`);
    } catch (error) {
      console.error(`  Error for ${req.name}:`, error);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("UI image generation complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
