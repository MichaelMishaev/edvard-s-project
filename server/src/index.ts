import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import playerRoutes from "./routes/players.js";
import gameRoutes from "./routes/games.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import badgeRoutes from "./routes/badges.js";
import contestRoutes from "./routes/contests.js";
import adminRoutes from "./routes/admin.js";
import { initContestJobs } from "./jobs/contestJobs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? true
      : ["http://localhost:5180", "http://localhost:3000"],
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/players", playerRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/admin", adminRoutes);

// Serve built client in production
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Jerusalem Quest server running on port ${PORT}`);

  // Initialize contest cron jobs
  try {
    console.log("[Server] Initializing contest cron jobs...");
    initContestJobs();
    console.log("[Server] Contest cron jobs initialization complete");
  } catch (error) {
    console.error("[Server] Failed to initialize contest cron jobs:", error);
  }
});

export default app;
