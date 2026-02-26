import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { players } from "../db/schema.js";
import { desc, asc } from "drizzle-orm";

const router = Router();

// GET /api/leaderboard - All players sorted by score DESC, timeSeconds ASC
router.get("/", async (req: Request, res: Response) => {
  try {
    const allPlayers = await db
      .select()
      .from(players)
      .orderBy(desc(players.score), asc(players.timeSeconds));

    res.json(allPlayers);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
