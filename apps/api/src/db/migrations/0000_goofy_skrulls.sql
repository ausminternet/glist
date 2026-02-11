CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`household_id` text NOT NULL,
	`sort_order` real DEFAULT 1000,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_categories_household_id` ON `categories` (`household_id`);--> statement-breakpoint
CREATE INDEX `idx_categories_household_name` ON `categories` (`household_id`,`name`);--> statement-breakpoint
CREATE TABLE `households` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `inventory_item_shops` (
	`inventory_item_id` text NOT NULL,
	`shop_id` text NOT NULL,
	PRIMARY KEY(`inventory_item_id`, `shop_id`),
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` text,
	`household_id` text NOT NULL,
	`target_stock` real,
	`target_stock_unit` text,
	`base_price_unit` text,
	`base_price_cents` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_items_household_id` ON `inventory_items` (`household_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_items_category_id` ON `inventory_items` (`category_id`);--> statement-breakpoint
CREATE TABLE `shopping_list_item_shops` (
	`shopping_list_item_id` text NOT NULL,
	`shop_id` text NOT NULL,
	PRIMARY KEY(`shopping_list_item_id`, `shop_id`),
	FOREIGN KEY (`shopping_list_item_id`) REFERENCES `shopping_list_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shopping_list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` text,
	`shopping_list_id` text NOT NULL,
	`inventory_item_id` text,
	`quantity` real,
	`quantity_unit` text,
	`checked` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`shopping_list_id`) REFERENCES `shopping_lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_shopping_list_items_shopping_list_id` ON `shopping_list_items` (`shopping_list_id`);--> statement-breakpoint
CREATE INDEX `idx_shopping_list_items_category_id` ON `shopping_list_items` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_shopping_list_items_list_checked` ON `shopping_list_items` (`shopping_list_id`,`checked`);--> statement-breakpoint
CREATE TABLE `shopping_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`household_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_shopping_lists_household_id` ON `shopping_lists` (`household_id`);--> statement-breakpoint
CREATE TABLE `shops` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`household_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`sort_order` real DEFAULT 1000,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_shops_household_id` ON `shops` (`household_id`);--> statement-breakpoint
CREATE INDEX `idx_shops_household_name` ON `shops` (`household_id`,`name`);