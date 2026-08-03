CREATE TABLE `developments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`neighborhood` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'EN POZO' NOT NULL,
	`delivery` text DEFAULT 'A confirmar' NOT NULL,
	`units` text DEFAULT '' NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`price_value` integer DEFAULT 0 NOT NULL,
	`price_prefix` text DEFAULT 'Desde' NOT NULL,
	`price_suffix` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`gallery` text DEFAULT '[]' NOT NULL,
	`floors` text DEFAULT '' NOT NULL,
	`apartments` text DEFAULT '' NOT NULL,
	`garages` text DEFAULT '' NOT NULL,
	`developer` text DEFAULT '' NOT NULL,
	`architect` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '[]' NOT NULL,
	`amenities` text DEFAULT '[]' NOT NULL,
	`specifications` text DEFAULT '[]' NOT NULL,
	`publication_status` text DEFAULT 'published' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `developments_slug_unique` ON `developments` (`slug`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`agency_name` text DEFAULT 'Ideamos Propiedades' NOT NULL,
	`contact_name` text DEFAULT 'Equipo Ideamos' NOT NULL,
	`contact_email` text DEFAULT 'hola@ideamos.ar' NOT NULL,
	`phone` text DEFAULT '+54 11 5555 0190' NOT NULL,
	`address` text DEFAULT 'Av. del Libertador 2424, Buenos Aires' NOT NULL,
	`schedule` text DEFAULT 'Lun. a vie. / 9 a 18 h' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `properties` ADD `price_prefix` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `price_suffix` text DEFAULT '' NOT NULL;