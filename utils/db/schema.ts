import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 42 }).notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  // New fields for artist onboarding
  name: varchar("name", { length: 255 }),
  artistBio: text("artist_bio"),
  profileImage: varchar("profile_image", { length: 255 }),
  website: varchar("website", { length: 255 }),
  socialMedia: jsonb("social_media"),
  artistType: varchar("artist_type", { length: 50 }),
  isVerifiedArtist: boolean("is_verified_artist").default(false),
  onboardingCompleted: boolean("onboarding_completed").default(false),
});

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(),
  contentHash: text("content_hash").notNull(),
  ipfsUrl: text("ipfs_url"),
  price: text("price").notNull(),
  tokenId: text("token_id"),
  licenseId: integer("license_id").references(() => licenses.id), // Add this line
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  details: text("details").notNull(),
  price: text("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
} as const);

export const usageRecords = pgTable("usage_records", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => contents.id),
  licenseId: integer("license_id").references(() => licenses.id),
  userId: varchar("user_id", { length: 255 }), // Change this to varchar
  aiAppId: varchar("ai_app_id", { length: 255 }),
  usageType: varchar("usage_type", { length: 50 }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 66 }),
  usageDate: timestamp("usage_date").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => contents.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  creatorId: integer("creator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiOutputs = pgTable("ai_outputs", {
  id: serial("id").primaryKey(),
  aiAppId: varchar("ai_app_id", { length: 255 }),
  outputHash: varchar("output_hash", { length: 66 }).notNull(),
  outputType: varchar("output_type", { length: 50 }).notNull(),
  usedContentIds: jsonb("used_content_ids"),
  createdAt: timestamp("created_at").defaultNow(),
});
