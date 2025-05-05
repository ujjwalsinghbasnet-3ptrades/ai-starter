CREATE TABLE IF NOT EXISTS "Models" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"input_cost" numeric(10, 6) NOT NULL,
	"output_cost" numeric(10, 6) NOT NULL,
	"unit_size" integer NOT NULL,
	"max_tokens" integer,
	"is_image_model" boolean DEFAULT false,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Providers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"bg_color" text NOT NULL,
	"enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Models" ADD CONSTRAINT "Models_provider_id_Providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."Providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
