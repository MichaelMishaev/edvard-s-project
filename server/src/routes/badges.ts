import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { players } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { BADGE_DEFINITIONS } from "../services/badges.js";

const router = Router();

// GET /api/badges - returns all badge definitions
router.get("/", (_req: Request, res: Response) => {
  res.json(BADGE_DEFINITIONS);
});

// GET /api/badges/:playerId - returns badge definitions + which ones the player has earned
router.get("/:playerId", async (req: Request, res: Response) => {
  try {
    const playerId = req.params.playerId as string;

    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId));

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    const earnedNames = new Set(player.badges);

    const badges = BADGE_DEFINITIONS.map((def) => ({
      ...def,
      earned: earnedNames.has(def.name),
    }));

    res.json({
      badges,
      earnedCount: player.badges.length,
      totalCount: BADGE_DEFINITIONS.length,
    });
  } catch (error) {
    console.error("Error fetching player badges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
