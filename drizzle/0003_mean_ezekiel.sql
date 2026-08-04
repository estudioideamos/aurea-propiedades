CREATE TABLE `tokko_integrations` (
	`admin_id` integer PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`api_key_ciphertext` text,
	`api_key_iv` text,
	`api_key_hint` text DEFAULT '' NOT NULL,
	`company_id` integer,
	`branch_id` integer,
	`last_sync_at` text,
	`last_sync_status` text DEFAULT 'never' NOT NULL,
	`last_sync_count` integer DEFAULT 0 NOT NULL,
	`last_sync_error` text DEFAULT '' NOT NULL,
	`sync_started_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `properties` ADD `source` text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `external_id` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `external_updated_at` text;