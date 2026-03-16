import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  jsonb,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 15 }).notNull(),
  score: integer("score").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  totalQuestions: integer("total_questions").default(10).notNull(),
  timeSeconds: integer("time_seconds").default(0).notNull(),
  badges: jsonb("badges").$type<string[]>().default([]).notNull(),
  className: text("class_name").notNull(),
  contestBadges: jsonb("contest_badges").$type<string[]>().default([]).notNull(),
  isTest: boolean("is_test").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id", { length: 10 }).primaryKey(),
  theme: varchar("theme", { length: 20 }).notNull().default("jerusalem"),
  topic: varchar("topic", { length: 50 }).notNull(),
  difficulty: integer("difficulty").notNull(),
  question: text("question").notNull(),
  answers: jsonb("answers").$type<{ id: string; text: string }[]>().notNull(),
  correctAnswerId: varchar("correct_answer_id", { length: 1 }).notNull(),
  timeLimitSec: integer("time_limit_sec").notNull(),
  explanation: text("explanation").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  imageUrl: text("image_url"),
});

export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id")
    .references(() => players.id)
    .notNull(),
  questionIds: jsonb("question_ids").$type<string[]>().notNull(),
  answers: jsonb("answers")
    .$type<
      {
        questionId: string;
        answerId: string;
        timeMs: number;
        correct: boolean;
      }[]
    >()
    .default([])
    .notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const contests = pgTable("contests", {
  id: uuid("id").defaultRandom().primaryKey(),
  weekNumber: integer("week_number").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: text("status", { enum: ["active", "closed", "cancelled"] })
    .notNull()
    .default("active"),
  minParticipants: integer("min_participants").notNull().default(10),
  totalParticipants: integer("total_participants").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contestParticipants = pgTable("contest_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  contestId: uuid("contest_id")
    .references(() => contests.id)
    .notNull(),
  playerId: uuid("player_id")
    .references(() => players.id)
    .notNull(),
  className: text("class_name").notNull(),
  classRank: integer("class_rank"),
  schoolRank: integer("school_rank"),
  isClassChampion: boolean("is_class_champion").notNull().default(false),
  isSchoolChampion: boolean("is_school_champion").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
});

export const hallOfFame = pgTable("hall_of_fame", {
  id: uuid("id").defaultRandom().primaryKey(),
  contestId: uuid("contest_id")
    .references(() => contests.id)
    .notNull(),
  playerId: uuid("player_id")
    .references(() => players.id)
    .notNull(),
  playerName: text("player_name").notNull(),
  className: text("class_name").notNull(),
  score: integer("score").notNull(),
  badges: jsonb("badges").$type<string[]>().notNull().default([]),
  rankType: text("rank_type", { enum: ["class_champion", "school_top10"] }).notNull(),
  rank: integer("rank").notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
