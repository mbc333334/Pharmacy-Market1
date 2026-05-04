import { Router } from "express";
import { db, admins, pharmacies, warehouses, deliveryCompanies, orders, announcements, payments, subscriptionPlans } from "@workspace/db";
import { eq, count, or } from "drizzle-orm";

const router = Router();

// GET /api/admin/stats — dashboard summary
router.get("/admin/stats", async (_req, res) => {
  try {
    const [phCount]  = await db.select({ count: count() }).from(pharmacies).where(eq(pharmacies.active, true));
    const [whCount]  = await db.select({ count: count() }).from(warehouses).where(eq(warehouses.active, true));
    const [dcCount]  = await db.select({ count: count() }).from(deliveryCompanies).where(eq(deliveryCompanies.active, true));
    const [ordCount] = await db.select({ count: count() }).from(orders);
    const phRows = await db.select({ revenue: pharmacies.revenue }).from(pharmacies);
    const whRows = await db.select({ revenue: warehouses.revenue }).from(warehouses);
    const dcRows = await db.select({ revenue: deliveryCompanies.revenue }).from(deliveryCompanies);
    const totalRev = [...phRows, ...whRows, ...dcRows].reduce((s, r) => s + (r.revenue || 0), 0);
    return res.json({
      pharmacies: phCount.count,
      warehouses: whCount.count,
      deliveryCompanies: dcCount.count,
      orders: ordCount.count,
      totalRevenue: totalRev,
    });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// GET /api/admins
router.get("/admins", async (_req, res) => {
  try {
    const rows = await db.select({ id: admins.id, phone: admins.phone, name: admins.name, role: admins.role, active: admins.active, createdAt: admins.createdAt }).from(admins);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/admins
router.post("/admins", async (req, res) => {
  try {
    const { phone, password, name, role } = req.body;
    if (!phone || !password || !name) return res.status(400).json({ error: "phone, password, name required" });
    const [created] = await db.insert(admins).values({ phone: phone.trim(), password: password.trim(), name, role: role || "supervisor" }).returning({ id: admins.id, phone: admins.phone, name: admins.name, role: admins.role });
    return res.status(201).json(created);
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "رقم الهاتف مسجّل مسبقاً" });
    return res.status(500).json({ error: "server error" });
  }
});

// PUT /api/admins/:id
router.put("/admins/:id", async (req, res) => {
  try {
    const { id, createdAt, ...data } = req.body;
    if (data.password === "") delete data.password;
    const [updated] = await db.update(admins).set(data).where(eq(admins.id, Number(req.params.id))).returning({ id: admins.id, phone: admins.phone, name: admins.name, role: admins.role, active: admins.active });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/admins/:id
router.delete("/admins/:id", async (req, res) => {
  try {
    await db.update(admins).set({ active: false }).where(eq(admins.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// ── ANNOUNCEMENTS ──────────────────────────────────────────────
// GET /api/announcements?target=all|pharmacy|warehouse|delivery
router.get("/announcements", async (req, res) => {
  try {
    const rows = await db.select().from(announcements).where(eq(announcements.active, true));
    const { target } = req.query as { target?: string };
    const filtered = target ? rows.filter(a => a.target === "all" || a.target === target) : rows;
    return res.json(filtered);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/announcements
router.post("/announcements", async (req, res) => {
  try {
    const { title, body, target } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const [created] = await db.insert(announcements).values({ title, body, target: target || "all" }).returning();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/announcements/:id
router.delete("/announcements/:id", async (req, res) => {
  try {
    await db.update(announcements).set({ active: false }).where(eq(announcements.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// ── APPROVAL / REGISTRATION REQUESTS ──────────────────────────

// GET /api/admin/pending — list all pending subscriber requests
router.get("/admin/pending", async (_req, res) => {
  try {
    const ph = await db.select().from(pharmacies).where(eq(pharmacies.approvalStatus, "pending"));
    const wh = await db.select().from(warehouses).where(eq(warehouses.approvalStatus, "pending"));
    const dc = await db.select().from(deliveryCompanies).where(eq(deliveryCompanies.approvalStatus, "pending"));
    return res.json({
      pharmacies: ph.map(r => { const { password: _p, ...s } = r; return { ...s, _type: "pharmacy" }; }),
      warehouses: wh.map(r => { const { password: _p, ...s } = r; return { ...s, _type: "warehouse" }; }),
      deliveries: dc.map(r => { const { password: _p, ...s } = r; return { ...s, _type: "delivery" }; }),
    });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PATCH /api/admin/approve/:type/:id — approve a subscriber
router.patch("/admin/approve/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const tableMap: Record<string, any> = { pharmacy: pharmacies, warehouse: warehouses, delivery: deliveryCompanies };
  const table = tableMap[type];
  if (!table) return res.status(400).json({ error: "invalid type" });
  try {
    const [updated] = await db.update(table).set({ approvalStatus: "approved", active: true, rejectionReason: null }).where(eq((table as any).id, id)).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PATCH /api/admin/reject/:type/:id — reject a subscriber
router.patch("/admin/reject/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const { reason } = req.body;
  const tableMap: Record<string, any> = { pharmacy: pharmacies, warehouse: warehouses, delivery: deliveryCompanies };
  const table = tableMap[type];
  if (!table) return res.status(400).json({ error: "invalid type" });
  try {
    const [updated] = await db.update(table).set({ approvalStatus: "rejected", active: false, rejectionReason: reason || null }).where(eq((table as any).id, id)).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// ── PAYMENTS ──────────────────────────────────────────────────
// GET /api/payments
router.get("/payments", async (_req, res) => {
  try {
    const rows = await db.select().from(payments);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/payments
router.post("/payments", async (req, res) => {
  try {
    const { subscriberType, subscriberId, plan, amount, method, refNumber } = req.body;
    if (!subscriberType || !subscriberId || !plan || !amount) return res.status(400).json({ error: "missing fields" });
    const [created] = await db.insert(payments).values({ subscriberType, subscriberId, plan, amount, method, refNumber, status: "pending" }).returning();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PATCH /api/payments/:id/status
router.patch("/payments/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db.update(payments).set({ status }).where(eq(payments.id, Number(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    // When approved, update the subscriber's plan
    if (status === "approved") {
      const tableMap: Record<string, any> = { pharmacy: pharmacies, warehouse: warehouses, delivery: deliveryCompanies };
      const table = tableMap[updated.subscriberType];
      if (table) {
        await db.update(table).set({ plan: updated.plan }).where(eq((table as any).id, updated.subscriberId));
      }
    }
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PATCH /api/admin/subscriber-plan/:type/:id — directly change subscriber plan
router.patch("/admin/subscriber-plan/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const { plan } = req.body;
  const tableMap: Record<string, any> = { pharmacy: pharmacies, warehouse: warehouses, delivery: deliveryCompanies };
  const table = tableMap[type];
  if (!table || !plan) return res.status(400).json({ error: "invalid type or missing plan" });
  try {
    const [updated] = await db.update(table).set({ plan }).where(eq((table as any).id, id)).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// ── SUBSCRIPTION PLANS ──────────────────────────────────────────────────────

const DEFAULT_PLANS = {
  pharmacy: [
    { subscriberType:"pharmacy", planId:"free",     nameAr:"مجاني",    price:0,      features:JSON.stringify(["حتى 50 دواء","ظهور في نتائج البحث","بدون عروض ترويجية","بدون إعلانات"]),            maxItems:50,   maxAds:0, hasOffers:false, hasAnalytics:false, priority:false },
    { subscriberType:"pharmacy", planId:"standard", nameAr:"أساسي",    price:25000,  features:JSON.stringify(["حتى 500 دواء","ظهور مميز في نتائج البحث","إنشاء عروض ترويجية","إعلان واحد شهرياً","تقارير مبيعات أساسية"]), maxItems:500,  maxAds:1, hasOffers:true,  hasAnalytics:false, priority:false },
    { subscriberType:"pharmacy", planId:"premium",  nameAr:"مميز",     price:75000,  features:JSON.stringify(["أدوية غير محدودة","أولوية في نتائج البحث","عروض ترويجية غير محدودة","3 إعلانات شهرياً","تحليلات مفصلة","دعم فني مخصص"]),  maxItems:9999, maxAds:3, hasOffers:true,  hasAnalytics:true,  priority:true  },
  ],
  warehouse: [
    { subscriberType:"warehouse", planId:"free",     nameAr:"مجاني",    price:0,      features:JSON.stringify(["حتى 200 منتج","ربط حتى 3 صيدليات","بدون إعلانات"]),                                                                      maxItems:200,  maxAds:0, hasOffers:false, hasAnalytics:false, priority:false },
    { subscriberType:"warehouse", planId:"standard", nameAr:"أساسي",    price:50000,  features:JSON.stringify(["حتى 2000 منتج","ربط حتى 20 صيدلية","إعلان واحد شهرياً","تقارير أساسية"]),                                                maxItems:2000, maxAds:1, hasOffers:false, hasAnalytics:false, priority:false },
    { subscriberType:"warehouse", planId:"premium",  nameAr:"مميز",     price:150000, features:JSON.stringify(["منتجات غير محدودة","صيدليات غير محدودة","3 إعلانات شهرياً","تحليلات متقدمة","دعم فني على مدار الساعة"]),                   maxItems:9999, maxAds:3, hasOffers:false, hasAnalytics:true,  priority:true  },
  ],
  delivery: [
    { subscriberType:"delivery", planId:"free",     nameAr:"مجاني",    price:0,      features:JSON.stringify(["حتى 5 سائقين","10 رحلات شهرياً","دعم واتساب","بدون تحليلات"]),                                                            maxItems:5,    maxAds:0, hasOffers:false, hasAnalytics:false, priority:false },
    { subscriberType:"delivery", planId:"standard", nameAr:"أساسي",    price:40000,  features:JSON.stringify(["حتى 20 سائقاً","رحلات غير محدودة","إعلان واحد شهرياً في التطبيق","تقارير أداء السائقين","دعم أولوية"]),                   maxItems:20,   maxAds:1, hasOffers:false, hasAnalytics:false, priority:false },
    { subscriberType:"delivery", planId:"premium",  nameAr:"مميز",     price:80000,  features:JSON.stringify(["سائقون ورحلات غير محدودة","أولوية في قوائم التوصيل","3 إعلانات شهرياً","تحليلات متقدمة","مدير حساب خاص","دعم 24/7"]),    maxItems:9999, maxAds:3, hasOffers:false, hasAnalytics:true,  priority:true  },
  ],
};

// GET /api/subscription-plans?type=pharmacy|warehouse|delivery
router.get("/subscription-plans", async (req, res) => {
  try {
    const { type } = req.query as { type?: string };
    let rows = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.active, true));
    if (rows.length === 0) {
      // Seed default plans on first request
      const allDefaults = [...DEFAULT_PLANS.pharmacy, ...DEFAULT_PLANS.warehouse, ...DEFAULT_PLANS.delivery];
      const inserted = await db.insert(subscriptionPlans).values(allDefaults).returning();
      rows = inserted;
    }
    const filtered = type ? rows.filter(r => r.subscriberType === type) : rows;
    return res.json(filtered.map(r => ({ ...r, features: JSON.parse(r.features || "[]") })));
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/subscription-plans
router.post("/subscription-plans", async (req, res) => {
  try {
    const { subscriberType, planId, nameAr, price, features, maxItems, maxAds, hasOffers, hasAnalytics, priority } = req.body;
    if (!subscriberType || !planId || !nameAr) return res.status(400).json({ error: "missing fields" });
    const [created] = await db.insert(subscriptionPlans).values({
      subscriberType, planId, nameAr,
      price: Number(price) || 0,
      features: JSON.stringify(Array.isArray(features) ? features : []),
      maxItems: Number(maxItems) || 0,
      maxAds: Number(maxAds) || 0,
      hasOffers: !!hasOffers,
      hasAnalytics: !!hasAnalytics,
      priority: !!priority,
    }).returning();
    return res.status(201).json({ ...created, features: JSON.parse(created.features || "[]") });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PUT /api/subscription-plans/:id
router.put("/subscription-plans/:id", async (req, res) => {
  try {
    const { id, subscriberType: _st, planId: _pi, ...rest } = req.body;
    const updates: any = {};
    if (rest.nameAr !== undefined)      updates.nameAr      = rest.nameAr;
    if (rest.price !== undefined)       updates.price       = Number(rest.price);
    if (rest.features !== undefined)    updates.features    = JSON.stringify(Array.isArray(rest.features) ? rest.features : []);
    if (rest.maxItems !== undefined)    updates.maxItems    = Number(rest.maxItems);
    if (rest.maxAds !== undefined)      updates.maxAds      = Number(rest.maxAds);
    if (rest.hasOffers !== undefined)   updates.hasOffers   = !!rest.hasOffers;
    if (rest.hasAnalytics !== undefined) updates.hasAnalytics = !!rest.hasAnalytics;
    if (rest.priority !== undefined)    updates.priority    = !!rest.priority;
    updates.updatedAt = new Date();
    const [updated] = await db.update(subscriptionPlans).set(updates).where(eq(subscriptionPlans.id, Number(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json({ ...updated, features: JSON.parse(updated.features || "[]") });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/subscription-plans/:id
router.delete("/subscription-plans/:id", async (req, res) => {
  try {
    await db.update(subscriptionPlans).set({ active: false }).where(eq(subscriptionPlans.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
