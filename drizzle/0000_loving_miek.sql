CREATE TABLE "module_indices_index_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"index_code" text NOT NULL,
	"value_date" text NOT NULL,
	"value" numeric NOT NULL,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_indices_code_date" ON "module_indices_index_values" USING btree ("index_code","value_date");--> statement-breakpoint
CREATE INDEX "idx_indices_lookup" ON "module_indices_index_values" USING btree ("index_code","value_date");