import { Router } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ONE-TIME MIGRATION ENDPOINT
 * Run once to apply contest migrations, then remove this file
 */
router.post("/run-contest-migration", async (req, res) => {
  try {
    const migrationPath = path.join(__dirname, "../../drizzle/0001_empty_eddie_brock.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split("-->")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("statement-breakpoint"));

    for (const statement of statements) {
      if (statement) {
        await db.execute(sql.raw(statement));
      }
    }

    res.json({
      success: true,
      message: "Contest tables created successfully",
      statements: statements.length,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: error.message,
      hint: "Tables might already exist",
    });
  }
});

export default router;
