ALTER TABLE `properties` ADD `covered_area` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `garages` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `age` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `condition` text DEFAULT 'Excelente' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `orientation` text DEFAULT 'Norte' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `gallery` text DEFAULT '[]' NOT NULL;