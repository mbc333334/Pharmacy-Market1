import { pgTable, serial, varchar, text, boolean, integer, decimal, date, timestamp } from "drizzle-orm/pg-core";

// ── ADMINS ──────────────────────────────────────────────────────
export const admins = pgTable("admins", {
  id:         serial("id").primaryKey(),
  phone:      varchar("phone", { length: 20 }).unique().notNull(),
  password:   varchar("password", { length: 255 }).notNull(),
  name:       varchar("name", { length: 100 }).notNull(),
  role:       varchar("role", { length: 20 }).notNull().default("supervisor"),
  active:     boolean("active").notNull().default(true),
  createdAt:  timestamp("created_at").defaultNow(),
});
export type Admin = typeof admins.$inferSelect;

// ── PHARMACIES ──────────────────────────────────────────────────
export const pharmacies = pgTable("pharmacies", {
  id:               varchar("id", { length: 10 }).primaryKey(),
  name:             varchar("name", { length: 100 }).notNull(),
  city:             varchar("city", { length: 50 }),
  phone:            varchar("phone", { length: 20 }).unique().notNull(),
  password:         varchar("password", { length: 255 }).notNull().default("123456"),
  email:            varchar("email", { length: 100 }),
  address:          text("address"),
  license:          varchar("license", { length: 50 }),
  plan:             varchar("plan", { length: 20 }).notNull().default("free"),
  active:           boolean("active").notNull().default(true),
  approvalStatus:   varchar("approval_status", { length: 20 }).notNull().default("approved"),
  rejectionReason:  text("rejection_reason"),
  revenue:          integer("revenue").default(0),
  joined:           date("joined"),
  facebook:         varchar("facebook", { length: 200 }),
  instagram:        varchar("instagram", { length: 200 }),
  whatsapp:         varchar("whatsapp", { length: 20 }),
  createdAt:        timestamp("created_at").defaultNow(),
});
export type Pharmacy = typeof pharmacies.$inferSelect;

// ── WAREHOUSES ──────────────────────────────────────────────────
export const warehouses = pgTable("warehouses", {
  id:               varchar("id", { length: 10 }).primaryKey(),
  name:             varchar("name", { length: 100 }).notNull(),
  city:             varchar("city", { length: 50 }),
  phone:            varchar("phone", { length: 20 }).unique().notNull(),
  password:         varchar("password", { length: 255 }).notNull().default("123456"),
  email:            varchar("email", { length: 100 }),
  address:          text("address"),
  license:          varchar("license", { length: 50 }),
  plan:             varchar("plan", { length: 20 }).notNull().default("free"),
  active:           boolean("active").notNull().default(true),
  approvalStatus:   varchar("approval_status", { length: 20 }).notNull().default("approved"),
  rejectionReason:  text("rejection_reason"),
  revenue:          integer("revenue").default(0),
  joined:           date("joined"),
  facebook:         varchar("facebook", { length: 200 }),
  instagram:        varchar("instagram", { length: 200 }),
  whatsapp:         varchar("whatsapp", { length: 20 }),
  createdAt:        timestamp("created_at").defaultNow(),
});
export type Warehouse = typeof warehouses.$inferSelect;

// ── DELIVERY COMPANIES ──────────────────────────────────────────
export const deliveryCompanies = pgTable("delivery_companies", {
  id:               varchar("id", { length: 10 }).primaryKey(),
  name:             varchar("name", { length: 100 }).notNull(),
  city:             varchar("city", { length: 50 }),
  phone:            varchar("phone", { length: 20 }).unique().notNull(),
  password:         varchar("password", { length: 255 }).notNull().default("123456"),
  email:            varchar("email", { length: 100 }),
  address:          text("address"),
  license:          varchar("license", { length: 50 }),
  plan:             varchar("plan", { length: 20 }).notNull().default("free"),
  active:           boolean("active").notNull().default(true),
  approvalStatus:   varchar("approval_status", { length: 20 }).notNull().default("approved"),
  rejectionReason:  text("rejection_reason"),
  revenue:          integer("revenue").default(0),
  rating:           decimal("rating", { precision: 3, scale: 1 }).default("5.0"),
  joined:           date("joined"),
  facebook:         varchar("facebook", { length: 200 }),
  instagram:        varchar("instagram", { length: 200 }),
  whatsapp:         varchar("whatsapp", { length: 20 }),
  createdAt:        timestamp("created_at").defaultNow(),
});
export type DeliveryCompany = typeof deliveryCompanies.$inferSelect;

// ── CUSTOMERS ───────────────────────────────────────────────────
export const customers = pgTable("customers", {
  id:         serial("id").primaryKey(),
  name:       varchar("name", { length: 100 }),
  phone:      varchar("phone", { length: 20 }).unique().notNull(),
  password:   varchar("password", { length: 255 }).notNull().default("123456"),
  city:       varchar("city", { length: 50 }),
  address:    text("address"),
  active:     boolean("active").notNull().default(true),
  createdAt:  timestamp("created_at").defaultNow(),
});
export type Customer = typeof customers.$inferSelect;

// ── PRODUCTS ────────────────────────────────────────────────────
export const products = pgTable("products", {
  id:          serial("id").primaryKey(),
  name:        varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price:       decimal("price", { precision: 12, scale: 2 }).notNull().default("0"),
  stock:       integer("stock").notNull().default(0),
  category:    varchar("category", { length: 50 }),
  ownerType:   varchar("owner_type", { length: 20 }).notNull(),
  ownerId:     varchar("owner_id", { length: 10 }).notNull(),
  imageUrl:    varchar("image_url", { length: 500 }),
  active:      boolean("active").notNull().default(true),
  createdAt:   timestamp("created_at").defaultNow(),
});
export type Product = typeof products.$inferSelect;

// ── ORDERS ──────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id:           serial("id").primaryKey(),
  customerId:   integer("customer_id"),
  pharmacyId:   varchar("pharmacy_id", { length: 10 }),
  deliveryId:   varchar("delivery_id", { length: 10 }),
  status:       varchar("status", { length: 30 }).notNull().default("pending"),
  total:        decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  address:      text("address"),
  notes:        text("notes"),
  createdAt:    timestamp("created_at").defaultNow(),
  updatedAt:    timestamp("updated_at").defaultNow(),
});
export type Order = typeof orders.$inferSelect;

// ── ORDER ITEMS ─────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id:         serial("id").primaryKey(),
  orderId:    integer("order_id"),
  productId:  integer("product_id"),
  qty:        integer("qty").notNull().default(1),
  price:      decimal("price", { precision: 12, scale: 2 }).notNull().default("0"),
});
export type OrderItem = typeof orderItems.$inferSelect;

// ── DRIVERS ─────────────────────────────────────────────────────
export const drivers = pgTable("drivers", {
  id:           serial("id").primaryKey(),
  deliveryId:   varchar("delivery_id", { length: 10 }),
  name:         varchar("name", { length: 100 }).notNull(),
  phone:        varchar("phone", { length: 20 }).notNull(),
  vehicle:      varchar("vehicle", { length: 100 }),
  status:       varchar("status", { length: 20 }).notNull().default("offline"),
  rating:       decimal("rating", { precision: 3, scale: 1 }).default("5.0"),
  tripsCount:   integer("trips_count").default(0),
  active:       boolean("active").notNull().default(true),
  createdAt:    timestamp("created_at").defaultNow(),
});
export type Driver = typeof drivers.$inferSelect;

// ── TRIPS ───────────────────────────────────────────────────────
export const trips = pgTable("trips", {
  id:             serial("id").primaryKey(),
  deliveryId:     varchar("delivery_id", { length: 10 }),
  driverId:       integer("driver_id"),
  orderId:        integer("order_id"),
  pickupAddress:  text("pickup_address"),
  dropAddress:    text("drop_address"),
  status:         varchar("status", { length: 20 }).notNull().default("pending"),
  distanceKm:     decimal("distance_km", { precision: 6, scale: 2 }),
  fee:            decimal("fee", { precision: 10, scale: 2 }),
  createdAt:      timestamp("created_at").defaultNow(),
  completedAt:    timestamp("completed_at"),
});
export type Trip = typeof trips.$inferSelect;

// ── WAREHOUSE-PHARMACY LINKS ─────────────────────────────────────
export const warehousePharmacyLinks = pgTable("warehouse_pharmacy_links", {
  id:           serial("id").primaryKey(),
  warehouseId:  varchar("warehouse_id", { length: 10 }),
  pharmacyId:   varchar("pharmacy_id", { length: 10 }),
  status:       varchar("status", { length: 20 }).notNull().default("active"),
  createdAt:    timestamp("created_at").defaultNow(),
});

// ── ANNOUNCEMENTS ───────────────────────────────────────────────
export const announcements = pgTable("announcements", {
  id:         serial("id").primaryKey(),
  title:      varchar("title", { length: 200 }).notNull(),
  body:       text("body"),
  target:     varchar("target", { length: 20 }).notNull().default("all"),
  active:     boolean("active").notNull().default(true),
  createdAt:  timestamp("created_at").defaultNow(),
});
export type Announcement = typeof announcements.$inferSelect;

// ── OTP CODES ───────────────────────────────────────────────────
export const otpCodes = pgTable("otp_codes", {
  id:         serial("id").primaryKey(),
  phone:      varchar("phone", { length: 20 }).notNull(),
  code:       varchar("code", { length: 6 }).notNull(),
  used:       boolean("used").notNull().default(false),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at").defaultNow(),
});

// ── PAYMENTS ────────────────────────────────────────────────────
export const payments = pgTable("payments", {
  id:              serial("id").primaryKey(),
  subscriberType:  varchar("subscriber_type", { length: 20 }).notNull(),
  subscriberId:    varchar("subscriber_id", { length: 10 }).notNull(),
  plan:            varchar("plan", { length: 20 }).notNull(),
  amount:          decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method:          varchar("method", { length: 30 }),
  refNumber:       varchar("ref_number", { length: 100 }),
  status:          varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt:       timestamp("created_at").defaultNow(),
});
export type Payment = typeof payments.$inferSelect;
