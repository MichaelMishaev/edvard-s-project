import { Router } from "express";
import { db } from "../db/index.js";
import { sql, eq } from "drizzle-orm";
import { players } from "../db/schema.js";
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

// PATCH /api/admin/players/:id/mark-test - Mark a player as test user
router.patch("/players/:id/mark-test", async (req, res) => {
  try {
    const { id } = req.params;
    const { isTest } = req.body as { isTest?: boolean };

    if (typeof isTest !== "boolean") {
      res.status(400).json({ error: "isTest must be a boolean" });
      return;
    }

    const [updated] = await db
      .update(players)
      .set({ isTest })
      .where(eq(players.id, id))
      .returning({ id: players.id, name: players.name, isTest: players.isTest });

    if (!updated) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    res.json({ success: true, player: updated });
  } catch (error: any) {
    console.error("Mark test error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
