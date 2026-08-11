CREATE TABLE IF NOT EXISTS `lead_submission_attempts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `ip` text NOT NULL,
  `attempted_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `lead_submission_attempts_lookup` ON `lead_submission_attempts` (`ip`,`attempted_at`);--> statement-breakpoint
PRAGMA optimize;
