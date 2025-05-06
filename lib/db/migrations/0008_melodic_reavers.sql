ALTER TABLE "Models" DROP CONSTRAINT "Models_provider_id_Providers_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Models" ADD CONSTRAINT "Models_provider_id_Providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."Providers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
