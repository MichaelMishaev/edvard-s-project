import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { players } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { isProfane } from "../services/profanity.js";

const router = Router();

// POST /api/players - Create player with name validation
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name?: string };

    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      res.status(400).json({ error: "Name cannot be empty" });
      return;
    }

    if (trimmedName.length > 15) {
      res.status(400).json({ error: "Name must be 15 characters or less" });
      return;
    }

    // Hebrew + English + numbers + spaces only
    const validNameRegex = /^[\u0590-\u05FFa-zA-Z0-9\s]+$/;
    if (!validNameRegex.test(trimmedName)) {
      res.status(400).json({ error: "Name can only contain Hebrew, English letters, numbers, and spaces" });
      return;
    }

    if (isProfane(trimmedName)) {
      res.status(400).json({ error: "This name is not allowed" });
      return;
    }

    // Check for duplicate names and generate unique name
    let finalName = trimmedName;
    const existingPlayers = await db
      .select({ name: players.name })
      .from(players)
      .where(
        sql`${players.name} = ${trimmedName} OR ${players.name} LIKE ${trimmedName + "%"}`
      );

    const existingNames = new Set(existingPlayers.map((p) => p.name));
    if (existingNames.has(trimmedName)) {
      let counter = 2;
      while (existingNames.has(`${trimmedName}${counter}`)) {
        counter++;
      }
      finalName = `${trimmedName}${counter}`;
    }

    const [newPlayer] = await db
      .insert(players)
      .values({ name: finalName })
      .returning();

    res.status(201).json(newPlayer);
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/players/:id - Get player by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id));

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    res.json(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
