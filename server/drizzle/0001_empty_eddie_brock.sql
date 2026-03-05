CREATE TABLE "contest_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contest_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"class_name" text NOT NULL,
	"class_rank" integer,
	"school_rank" integer,
	"is_class_champion" boolean DEFAULT false NOT NULL,
	"is_school_champion" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_number" integer NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"min_participants" integer DEFAULT 10 NOT NULL,
	"total_participants" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hall_of_fame" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contest_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"player_name" text NOT NULL,
	"class_name" text NOT NULL,
	"score" integer NOT NULL,
	"badges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rank_type" text NOT NULL,
	"rank" integer NOT NULL,
	"archived_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Add class_name with default value for existing players
ALTER TABLE "players" ADD COLUMN "class_name" text DEFAULT 'כיתה א' NOT NULL;--> statement-breakpoint
-- Add contest_badges column
ALTER TABLE "players" ADD COLUMN "contest_badges" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
-- Remove default after setting existing rows
ALTER TABLE "players" ALTER COLUMN "class_name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "contest_participants" ADD CONSTRAINT "contest_participants_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_participants" ADD CONSTRAINT "contest_participants_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_of_fame" ADD CONSTRAINT "hall_of_fame_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_of_fame" ADD CONSTRAINT "hall_of_fame_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;