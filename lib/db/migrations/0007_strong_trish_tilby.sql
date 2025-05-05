CREATE TABLE IF NOT EXISTS "UserProviderConfig" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"default_provider_id" text,
	"provider_settings" jsonb,
	"model_settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserProviderConfig" ADD CONSTRAINT "UserProviderConfig_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserProviderConfig" ADD CONSTRAINT "UserProviderConfig_default_provider_id_Providers_id_fk" FOREIGN KEY ("default_provider_id") REFERENCES "public"."Providers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
