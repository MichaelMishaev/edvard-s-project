import { TZDate } from "@date-fns/tz";
import {
  startOfWeek,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  getWeek,
} from "date-fns";
import { db } from "../db/index.js";
import {
  contests,
  contestParticipants,
  hallOfFame,
  players,
} from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { CLASSES } from "../config/classes.js";

const ISRAEL_TZ = "Asia/Jerusalem";
const MIN_PARTICIPANTS = 10;

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  total: number;
}

/**
 * Calculate time remaining until contest end date
 */
function calculateTimeRemaining(endDate: Date): TimeRemaining {
  const now = new TZDate(Date.now(), ISRAEL_TZ);
  const end = new TZDate(endDate, ISRAEL_TZ);
  const total = end.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, total: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, total };
}

/**
 * Get next Sunday at 00:00 Israel time
 */
function getNextSunday(): Date {
  const now = new TZDate(Date.now(), ISRAEL_TZ);
  let nextSunday = startOfWeek(now, { weekStartsOn: 0 }); // Sunday = 0

  // If it's already Sunday, move to next week
  if (nextSunday.getTime() <= now.getTime()) {
    nextSunday = addDays(nextSunday, 7);
  }

  // Set to 00:00:00
  return setSeconds(setMinutes(setHours(nextSunday, 0), 0), 0);
}

/**
 * Get Friday at 12:00 for the given Sunday
 */
function getFridayFromSunday(sunday: Date): Date {
  const friday = addDays(sunday, 5); // Sunday + 5 = Friday
  return setSeconds(setMinutes(setHours(friday, 12), 0), 0);
}

/**
 * Create a new weekly contest
 */
export async function createWeeklyContest() {
  const startDate = getNextSunday();
  const endDate = getFridayFromSunday(startDate);
  const weekNumber = getWeek(startDate);

  const [contest] = await db
    .insert(contests)
    .values({
      weekNumber,
      startDate,
      endDate,
      status: "active",
      minParticipants: MIN_PARTICIPANTS,
      totalParticipants: 0,
    })
    .returning();

  console.log(
    `[Contest] Created weekly contest #${weekNumber} (${startDate.toISOString()} - ${endDate.toISOString()})`
  );

  return contest;
}

/**
 * Get the current active contest
 */
export async function getCurrentContest() {
  const [contest] = await db
    .select()
    .from(contests)
    .where(eq(contests.status, "active"))
    .orderBy(desc(contests.createdAt))
    .limit(1);

  if (!contest) {
    return null;
  }

  const timeRemaining = calculateTimeRemaining(contest.endDate);

  return {
    contestId: contest.id,
    weekNumber: contest.weekNumber,
    startDate: contest.startDate.toISOString(),
    endDate: contest.endDate.toISOString(),
    status: contest.status,
    totalParticipants: contest.totalParticipants,
    minParticipants: contest.minParticipants,
    timeRemaining,
  };
}

/**
 * Register a player's participation in a contest
 */
export async function registerParticipation(
  contestId: string,
  playerId: string,
  className: string
) {
  const now = new TZDate(Date.now(), ISRAEL_TZ);

  // Check if already participated
  const [existing] = await db
    .select()
    .from(contestParticipants)
    .where(
      and(
        eq(contestParticipants.contestId, contestId),
        eq(contestParticipants.playerId, playerId)
      )
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  // Insert participation record
  const [participant] = await db
    .insert(contestParticipants)
    .values({
      contestId,
      playerId,
      className,
      completedAt: now,
    })
    .returning();

  // Increment total participants count
  await db
    .update(contests)
    .set({
      totalParticipants: sql`${contests.totalParticipants} + 1`,
    })
    .where(eq(contests.id, contestId));

  console.log(`[Contest] Player ${playerId} registered for contest ${contestId}`);

  return participant;
}

/**
 * Calculate rankings for all participants
 */
async function calculateRankings(contestId: string) {
  // Get all participants with their player data
  const participants = await db
    .select({
      participantId: contestParticipants.id,
      playerId: players.id,
      playerName: players.name,
      className: contestParticipants.className,
      score: players.score,
      timeSeconds: players.timeSeconds,
      badges: players.badges,
    })
    .from(contestParticipants)
    .innerJoin(players, eq(contestParticipants.playerId, players.id))
    .where(eq(contestParticipants.contestId, contestId))
    .orderBy(desc(players.score), players.timeSeconds);

  // Calculate school-wide rankings
  const schoolRankings = participants.map((p, index) => ({
    ...p,
    schoolRank: index + 1,
  }));

  // Calculate class rankings for each class
  const classRankings = new Map<string, typeof schoolRankings>();

  for (const classConfig of CLASSES) {
    const classPlayers = schoolRankings
      .filter((p) => p.className === classConfig.id)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.timeSeconds - b.timeSeconds;
      })
      .map((p, index) => ({
        ...p,
        classRank: index + 1,
      }));

    classRankings.set(classConfig.id, classPlayers);
  }

  // Update participant records with rankings
  for (const participant of schoolRankings) {
    const classPlayers = classRankings.get(participant.className);
    const classPlayer = classPlayers?.find((p) => p.playerId === participant.playerId);

    await db
      .update(contestParticipants)
      .set({
        classRank: classPlayer?.classRank,
        schoolRank: participant.schoolRank,
        isClassChampion: classPlayer?.classRank === 1,
        isSchoolChampion: participant.schoolRank <= 10,
      })
      .where(eq(contestParticipants.id, participant.participantId));
  }

  return { schoolRankings, classRankings };
}

/**
 * Award contest badges to winners
 */
async function awardContestBadges(contestId: string) {
  const participants = await db
    .select()
    .from(contestParticipants)
    .where(eq(contestParticipants.contestId, contestId));

  for (const participant of participants) {
    const badges: string[] = [];

    if (participant.isClassChampion) {
      badges.push("אלוף הכיתה");
    }

    if (participant.isSchoolChampion) {
      badges.push("אלוף בית הספר");
    }

    if (badges.length > 0) {
      await db
        .update(players)
        .set({
          contestBadges: sql`array_cat(${players.contestBadges}, ${badges}::text[])`,
        })
        .where(eq(players.id, participant.playerId));

      console.log(
        `[Contest] Awarded badges to player ${participant.playerId}: ${badges.join(", ")}`
      );
    }
  }
}

/**
 * Archive winners to Hall of Fame
 */
async function archiveWinners(contestId: string) {
  const participants = await db
    .select({
      participant: contestParticipants,
      player: players,
    })
    .from(contestParticipants)
    .innerJoin(players, eq(contestParticipants.playerId, players.id))
    .where(
      and(
        eq(contestParticipants.contestId, contestId),
        sql`(${contestParticipants.isClassChampion} = true OR ${contestParticipants.isSchoolChampion} = true)`
      )
    );

  const now = new TZDate(Date.now(), ISRAEL_TZ);

  for (const { participant, player } of participants) {
    // Archive class champions (top 3 per class)
    if (participant.isClassChampion && participant.classRank && participant.classRank <= 3) {
      await db.insert(hallOfFame).values({
        contestId,
        playerId: player.id,
        playerName: player.name,
        className: participant.className,
        score: player.score,
        badges: player.badges,
        rankType: "class_champion",
        rank: participant.classRank,
        archivedAt: now,
      });
    }

    // Archive school top 10
    if (participant.isSchoolChampion && participant.schoolRank && participant.schoolRank <= 10) {
      await db.insert(hallOfFame).values({
        contestId,
        playerId: player.id,
        playerName: player.name,
        className: participant.className,
        score: player.score,
        badges: player.badges,
        rankType: "school_top10",
        rank: participant.schoolRank,
        archivedAt: now,
      });
    }
  }

  console.log(`[Contest] Archived ${participants.length} winners to Hall of Fame`);
}

/**
 * Close a contest and process winners
 */
export async function closeContest(contestId: string) {
  const [contest] = await db
    .select()
    .from(contests)
    .where(eq(contests.id, contestId))
    .limit(1);

  if (!contest) {
    throw new Error(`Contest ${contestId} not found`);
  }

  if (contest.status !== "active") {
    console.log(`[Contest] Contest ${contestId} already closed`);
    return;
  }

  // Check if minimum participants met
  if (contest.totalParticipants < contest.minParticipants) {
    await db
      .update(contests)
      .set({ status: "cancelled" })
      .where(eq(contests.id, contestId));

    console.log(
      `[Contest] Contest ${contestId} cancelled - only ${contest.totalParticipants} participants (minimum: ${contest.minParticipants})`
    );
    return;
  }

  // Calculate rankings
  await calculateRankings(contestId);

  // Award badges
  await awardContestBadges(contestId);

  // Archive winners
  await archiveWinners(contestId);

  // Mark contest as closed
  await db
    .update(contests)
    .set({ status: "closed" })
    .where(eq(contests.id, contestId));

  console.log(
    `[Contest] Contest ${contestId} closed with ${contest.totalParticipants} participants`
  );
}

/**
 * Get Hall of Fame data
 */
export async function getHallOfFame() {
  // Get all closed contests with their winners
  const closedContests = await db
    .select()
    .from(contests)
    .where(eq(contests.status, "closed"))
    .orderBy(desc(contests.weekNumber));

  const hallOfFameData = [];

  for (const contest of closedContests) {
    // Get winners for this contest
    const winners = await db
      .select()
      .from(hallOfFame)
      .where(eq(hallOfFame.contestId, contest.id))
      .orderBy(hallOfFame.rankType, hallOfFame.rank);

    // Group class champions
    const classChampions = winners
      .filter((w) => w.rankType === "class_champion")
      .map((w) => ({
        className: w.className,
        playerName: w.playerName,
        score: w.score,
        rank: w.rank,
      }));

    // Get school top 10
    const schoolTop10 = winners
      .filter((w) => w.rankType === "school_top10")
      .map((w) => ({
        rank: w.rank,
        playerName: w.playerName,
        className: w.className,
        score: w.score,
      }));

    // Calculate badge statistics
    const allBadges = winners.flatMap((w) => w.badges);
    const badgeCount = new Map<string, number>();
    for (const badge of allBadges) {
      badgeCount.set(badge, (badgeCount.get(badge) || 0) + 1);
    }

    const badgeStats = Array.from(badgeCount.entries()).map(([badgeName, count]) => ({
      badgeName,
      count,
    }));

    hallOfFameData.push({
      weekNumber: contest.weekNumber,
      dateRange: `${contest.startDate.toLocaleDateString("he-IL")} - ${contest.endDate.toLocaleDateString("he-IL")}`,
      totalParticipants: contest.totalParticipants,
      classChampions,
      schoolTop10,
      badgeStats,
    });
  }

  return hallOfFameData;
}
