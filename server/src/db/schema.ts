import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 15 }).notNull(),
  score: integer("score").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  totalQuestions: integer("total_questions").default(10).notNull(),
  timeSeconds: integer("time_seconds").default(0).notNull(),
  badges: jsonb("badges").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id", { length: 10 }).primaryKey(),
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
