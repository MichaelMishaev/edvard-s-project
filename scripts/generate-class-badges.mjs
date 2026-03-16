import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../client/public/images/class-badges");
const API_KEY = "fGDoK4f_gOWFjcDaS4vLxaavoVaWtzD8EgQXJiqWP72Fz3PBSg-bRzdtup_ajnP_vBBUZXZhBnPF3Y-CLxv4MA";

mkdirSync(OUT_DIR, { recursive: true });

const CLASSES = [
  { id: "dalet1", label: "ד׳1", color: "#4f46e5" },
  { id: "dalet2", label: "ד׳2", color: "#7c3aed" },
  { id: "dalet3", label: "ד׳3", color: "#0891b2" },
  { id: "dalet4", label: "ד׳4", color: "#0d9488" },
  { id: "heh1",   label: "ה׳1", color: "#d97706" },
  { id: "heh2",   label: "ה׳2", color: "#dc2626" },
  { id: "heh3",   label: "ה׳3", color: "#059669" },
  { id: "heh4",   label: "ה׳4", color: "#db2777" },
  { id: "vav1",   label: "ו׳1", color: "#2563eb" },
  { id: "vav2",   label: "ו׳2", color: "#9333ea" },
  { id: "vav3",   label: "ו׳3", color: "#16a34a" },
  { id: "vav4",   label: "ו׳4", color: "#ea580c" },
];

async function generateBadge(cls) {
  const prompt = `A vibrant colorful school class badge sticker, bold large Hebrew text "${cls.label}" centered prominently, decorative shield emblem shape, gold stars and sparkles around it, bright gradient background, children educational game art style, flat vector illustration, clean white padding around badge, square format. Text must be clearly readable.`;

  const form = new FormData();
  form.append("prompt", prompt);
  form.append("rendering_speed", "TURBO");
  form.append("style_type", "DESIGN");
  form.append("magic_prompt", "OFF");
  form.append("aspect_ratio", "1x1");

  console.log(`Generating badge for ${cls.id} (${cls.label})...`);

  const res = await fetch("https://api.ideogram.ai/v1/ideogram-v3/generate", {
    method: "POST",
    headers: { "Api-Key": API_KEY },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed ${cls.id}: ${res.status} ${text}`);
    return;
  }

  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) {
    console.error(`No URL for ${cls.id}:`, JSON.stringify(data));
    return;
  }

  // Download image
  const imgRes = await fetch(url);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const outPath = join(OUT_DIR, `${cls.id}.png`);
  writeFileSync(outPath, buffer);
  console.log(`✅ Saved ${cls.id}.png`);
}

// Generate 3 at a time to avoid rate limits
async function runBatches() {
  const batchSize = 3;
  for (let i = 0; i < CLASSES.length; i += batchSize) {
    const batch = CLASSES.slice(i, i + batchSize);
    await Promise.all(batch.map(generateBadge));
    if (i + batchSize < CLASSES.length) {
      console.log("Waiting 2s between batches...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.log("\nAll badges generated!");
}

runBatches().catch(console.error);
