ALTER TABLE `developments` ADD `source` text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `developments` ADD `external_id` text;--> statement-breakpoint
ALTER TABLE `developments` ADD `external_updated_at` text;