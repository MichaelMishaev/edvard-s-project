import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { players } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { JERUSALEM_BADGE_DEFINITIONS, PESACH_BADGE_DEFINITIONS } from "../services/badges.js";

const router = Router();

// GET /api/badges - returns all badge definitions (optionally filtered by theme)
router.get("/", (req: Request, res: Response) => {
  const theme = req.query.theme as string | undefined;
  const defs = theme === "pesach" ? PESACH_BADGE_DEFINITIONS : JERUSALEM_BADGE_DEFINITIONS;
  res.json(defs);
});

// GET /api/badges/:playerId - returns badge definitions + which ones the player has earned
router.get("/:playerId", async (req: Request, res: Response) => {
  try {
    const playerId = req.params.playerId as string;
    const theme = (req.query.theme as string) || "jerusalem";

    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId));

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    const earnedNames = new Set(player.badges);
    const defs = theme === "pesach" ? PESACH_BADGE_DEFINITIONS : JERUSALEM_BADGE_DEFINITIONS;

    const badges = defs.map((def) => ({
      ...def,
      earned: earnedNames.has(def.name),
    }));

    const earnedCount = badges.filter((b) => b.earned).length;

    res.json({
      badges,
      earnedCount,
      totalCount: defs.length,
    });
  } catch (error) {
    console.error("Error fetching player badges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
