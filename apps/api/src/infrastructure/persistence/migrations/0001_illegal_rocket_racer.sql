CREATE TABLE `inventory_item_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`inventory_item_id` text NOT NULL,
	`photo_key` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_item_photos_item_id` ON `inventory_item_photos` (`inventory_item_id`);--> statement-breakpoint
CREATE TABLE `shopping_list_item_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`shopping_list_item_id` text NOT NULL,
	`photo_key` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`shopping_list_item_id`) REFERENCES `shopping_list_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_shopping_list_item_photos_item_id` ON `shopping_list_item_photos` (`shopping_list_item_id`);--> statement-breakpoint
ALTER TABLE `inventory_items` DROP COLUMN `photo_key`;--> statement-breakpoint
ALTER TABLE `shopping_list_items` DROP COLUMN `photo_key`;