import cron from "node-cron";
import {
  createWeeklyContest,
  closeContest,
  getCurrentContest,
} from "../services/contestService.js";

/**
 * Initialize contest cron jobs
 */
export function initContestJobs() {
  // Every Sunday at 00:00 Israel time - Create new contest
  cron.schedule(
    "0 0 * * 0",
    async () => {
      try {
        console.log("[Cron] Creating weekly contest...");
        await createWeeklyContest();
      } catch (error) {
        console.error("[Cron] Error creating weekly contest:", error);
      }
    },
    {
      timezone: "Asia/Jerusalem",
    }
  );

  // Every Friday at 12:00 Israel time - Close current contest
  cron.schedule(
    "0 12 * * 5",
    async () => {
      try {
        console.log("[Cron] Closing weekly contest...");
        const contest = await getCurrentContest();
        if (contest) {
          await closeContest(contest.contestId);
        } else {
          console.log("[Cron] No active contest to close");
        }
      } catch (error) {
        console.error("[Cron] Error closing weekly contest:", error);
      }
    },
    {
      timezone: "Asia/Jerusalem",
    }
  );

  console.log("[Cron] Contest jobs initialized");
}
