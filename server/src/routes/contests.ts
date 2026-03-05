import { Router } from "express";
import {
  getCurrentContest,
  getHallOfFame,
  registerParticipation,
} from "../services/contestService.js";
import { isValidClass } from "../config/classes.js";

const router = Router();

/**
 * GET /api/contests/current
 * Returns the current active contest with time remaining
 */
router.get("/current", async (req, res) => {
  try {
    const contest = await getCurrentContest();

    if (!contest) {
      return res.status(404).json({ error: "No active contest found" });
    }

    res.json(contest);
  } catch (error) {
    console.error("Error fetching current contest:", error);
    res.status(500).json({ error: "Failed to fetch current contest" });
  }
});

/**
 * GET /api/contests/hall-of-fame
 * Returns archived winners from past contests
 */
router.get("/hall-of-fame", async (req, res) => {
  try {
    const hallOfFameData = await getHallOfFame();
    res.json(hallOfFameData);
  } catch (error) {
    console.error("Error fetching hall of fame:", error);
    res.status(500).json({ error: "Failed to fetch hall of fame" });
  }
});

/**
 * POST /api/contests/:contestId/participate
 * Registers player participation in a contest
 */
router.post("/:contestId/participate", async (req, res) => {
  try {
    const { contestId } = req.params;
    const { playerId, className } = req.body;

    // Validate inputs
    if (!playerId || !className) {
      return res.status(400).json({ error: "Missing playerId or className" });
    }

    if (!isValidClass(className)) {
      return res.status(400).json({ error: "Invalid className" });
    }

    // Verify contest is active
    const contest = await getCurrentContest();
    if (!contest || contest.contestId !== contestId) {
      return res
        .status(400)
        .json({ error: "Contest is not active or does not exist" });
    }

    // Register participation
    const participant = await registerParticipation(
      contestId,
      playerId,
      className
    );

    res.json({ success: true, participant });
  } catch (error) {
    console.error("Error registering participation:", error);
    res.status(500).json({ error: "Failed to register participation" });
  }
});

export default router;
