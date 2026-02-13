PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`household_id` text NOT NULL,
	`sort_order` real DEFAULT 1000,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "household_id", "sort_order", "created_at", "updated_at") SELECT "id", "name", "household_id", "sort_order", "created_at", "updated_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_categories_household_id` ON `categories` (`household_id`);--> statement-breakpoint
CREATE INDEX `idx_categories_household_name` ON `categories` (`household_id`,`name`);--> statement-breakpoint
CREATE TABLE `__new_households` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_households`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `households`;--> statement-breakpoint
DROP TABLE `households`;--> statement-breakpoint
ALTER TABLE `__new_households` RENAME TO `households`;--> statement-breakpoint
CREATE TABLE `__new_inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` text,
	`household_id` text NOT NULL,
	`target_stock` real,
	`target_stock_unit` text,
	`base_price_unit` text,
	`base_price_cents` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_inventory_items`("id", "name", "description", "category_id", "household_id", "target_stock", "target_stock_unit", "base_price_unit", "base_price_cents", "created_at", "updated_at") SELECT "id", "name", "description", "category_id", "household_id", "target_stock", "target_stock_unit", "base_price_unit", "base_price_cents", "created_at", "updated_at" FROM `inventory_items`;--> statement-breakpoint
DROP TABLE `inventory_items`;--> statement-breakpoint
ALTER TABLE `__new_inventory_items` RENAME TO `inventory_items`;--> statement-breakpoint
CREATE INDEX `idx_inventory_items_household_id` ON `inventory_items` (`household_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_items_category_id` ON `inventory_items` (`category_id`);--> statement-breakpoint
CREATE TABLE `__new_shopping_list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` text,
	`shopping_list_id` text NOT NULL,
	`inventory_item_id` text,
	`quantity` real,
	`quantity_unit` text,
	`checked` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`shopping_list_id`) REFERENCES `shopping_lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_shopping_list_items`("id", "name", "description", "category_id", "shopping_list_id", "inventory_item_id", "quantity", "quantity_unit", "checked", "created_at", "updated_at") SELECT "id", "name", "description", "category_id", "shopping_list_id", "inventory_item_id", "quantity", "quantity_unit", "checked", "created_at", "updated_at" FROM `shopping_list_items`;--> statement-breakpoint
DROP TABLE `shopping_list_items`;--> statement-breakpoint
ALTER TABLE `__new_shopping_list_items` RENAME TO `shopping_list_items`;--> statement-breakpoint
CREATE INDEX `idx_shopping_list_items_shopping_list_id` ON `shopping_list_items` (`shopping_list_id`);--> statement-breakpoint
CREATE INDEX `idx_shopping_list_items_category_id` ON `shopping_list_items` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_shopping_list_items_list_checked` ON `shopping_list_items` (`shopping_list_id`,`checked`);--> statement-breakpoint
CREATE TABLE `__new_shopping_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`household_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_shopping_lists`("id", "name", "household_id", "created_at", "updated_at") SELECT "id", "name", "household_id", "created_at", "updated_at" FROM `shopping_lists`;--> statement-breakpoint
DROP TABLE `shopping_lists`;--> statement-breakpoint
ALTER TABLE `__new_shopping_lists` RENAME TO `shopping_lists`;--> statement-breakpoint
CREATE INDEX `idx_shopping_lists_household_id` ON `shopping_lists` (`household_id`);--> statement-breakpoint
CREATE TABLE `__new_shops` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`household_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`sort_order` real DEFAULT 1000,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_shops`("id", "name", "household_id", "created_at", "updated_at", "sort_order") SELECT "id", "name", "household_id", "created_at", "updated_at", "sort_order" FROM `shops`;--> statement-breakpoint
DROP TABLE `shops`;--> statement-breakpoint
ALTER TABLE `__new_shops` RENAME TO `shops`;--> statement-breakpoint
CREATE INDEX `idx_shops_household_id` ON `shops` (`household_id`);--> statement-breakpoint
CREATE INDEX `idx_shops_household_name` ON `shops` (`household_id`,`name`);