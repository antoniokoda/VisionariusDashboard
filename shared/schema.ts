import { pgTable, text, serial, integer, date, decimal, boolean, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Now represents "Sales Opportunity Name"
  contacts: text("contacts").default("[]"), // JSON array of contact objects
  
  // Discovery call dates and durations
  discovery1Date: date("discovery1_date"),
  discovery1Duration: integer("discovery1_duration"), // in minutes
  discovery1Recording: text("discovery1_recording"),
  
  discovery2Date: date("discovery2_date"),
  discovery2Duration: integer("discovery2_duration"),
  discovery2Recording: text("discovery2_recording"),
  
  discovery3Date: date("discovery3_date"),
  discovery3Duration: integer("discovery3_duration"),
  discovery3Recording: text("discovery3_recording"),
  
  // Closing call dates and durations
  closing1Date: date("closing1_date"),
  closing1Duration: integer("closing1_duration"),
  closing1Recording: text("closing1_recording"),
  
  closing2Date: date("closing2_date"),
  closing2Duration: integer("closing2_duration"),
  closing2Recording: text("closing2_recording"),
  
  closing3Date: date("closing3_date"),
  closing3Duration: integer("closing3_duration"),
  closing3Recording: text("closing3_recording"),
  
  // Proposal and revenue
  proposalStatus: text("proposal_status").notNull().default("N/A"), // N/A, Created, Pitched
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  cashCollected: decimal("cash_collected", { precision: 10, scale: 2 }).default("0"),
  
  // Status tracking
  dealStatus: text("deal_status", { enum: ["Open", "Won", "Lost"] }).default("Open"),
  isWon: boolean("is_won").default(false),
  isLost: boolean("is_lost").default(false),
  
  // Lead source and salesperson tracking
  leadSource: text("lead_source", { enum: ["Referrals", "Cold Calling", "Skool Community", "YouTube", "Members of the team"] }).default("Referrals"),
  salesperson: text("salesperson").notNull().default("Unknown"),
  
  // File storage (JSON array of file URLs/names)
  files: text("files").default("[]"),
  
  // Notes and conversation
  notes: text("notes"),
  conversation: text("conversation").default("[]"), // JSON array of conversation messages
  
  // Created date for filtering
  createdAt: date("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const updateClientSchema = insertClientSchema.partial();

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type UpdateClient = z.infer<typeof updateClientSchema>;

// KPI calculation types
export interface KPIData {
  totalRevenue: number;
  totalRevenueChange?: number;
  cashCollected: number;
  cashCollectedChange?: number;
  closingRate: number;
  closingRateChange?: number;
  proposalsPitched: number;
  proposalsPitchedChange?: number;
  avgSalesCycle: number;
  avgSalesCycleChange?: number;
  totalCalls: number;
  totalCallsChange?: number;
  avgDealSize: number;
  avgDealSizeChange?: number;
}

export interface ShowUpRates {
  firstDiscovery: number;
  secondDiscovery: number;
  thirdDiscovery: number;
  firstClosing: number;
  secondClosing: number;
  thirdClosing: number;
  overall: number;
}

export interface FunnelNode {
  id: string;
  name: string;
  value: number;
}

export interface FunnelLink {
  source: string;
  target: string;
  value: number;
}

export interface FunnelData {
  nodes: FunnelNode[];
  links: FunnelLink[];
}

export interface TimeMetrics {
  discoveryToClosing: number;
  discoveryToFinalClose: number;
  betweenDiscovery: number;
  betweenClosing: number;
  salesCycle: number;
}

export interface CallMetrics {
  discoveryDuration: number;
  closingDuration: number;
  avgRevenue: number;
}

export interface TrendData {
  period: string;
  revenue: number;
  deals: number;
  closingRate: number;
  cashCollected: number;
}

export interface LeadSourceData {
  source: string;
  count: number;
  percentage: number;
  revenue: number;
  conversionRate: number;
}

export interface SalespersonPerformance {
  name: string;
  totalRevenue: number;
  dealsWon: number;
  closingRate: number;
  avgDealSize: number;
  totalCalls: number;
}

export interface DashboardData {
  kpis: KPIData;
  showUpRates: ShowUpRates;
  funnelData: FunnelData;
  timeMetrics: TimeMetrics;
  callMetrics: CallMetrics;
  trendData: TrendData[];
  leadSources: LeadSourceData[];
  salespeople: SalespersonPerformance[];
}



// Calendar event interface
export interface CalendarEvent {
  id: string;
  title: string;
  clientId: number;
  clientName: string;
  date: string;
  type: "discovery1" | "discovery2" | "discovery3" | "closing1" | "closing2" | "closing3";
  duration?: number;
  recording?: string;
}

// Conversation message interface
export interface ConversationMessage {
  id: string;
  userId: number;
  userName: string;
  message: string;
  type: "text" | "audio" | "file";
  timestamp: string;
  fileUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
