CREATE TABLE "id_ranges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" text NOT NULL,
	"start_id" bigint NOT NULL,
	"end_id" bigint NOT NULL,
	"next_id" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "id_ranges_server_id_unique" UNIQUE("server_id")
);
