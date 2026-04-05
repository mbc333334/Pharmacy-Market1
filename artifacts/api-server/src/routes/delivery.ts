import { Router } from "express";
import { db, deliveryCompanies, drivers, trips } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/delivery-companies
router.get("/delivery-companies", async (_req, res) => {
  try {
    const rows = await db.select().from(deliveryCompanies);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// GET /api/delivery-companies/:id
router.get("/delivery-companies/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(deliveryCompanies).where(eq(deliveryCompanies.id, req.params.id));
    if (!row) return res.status(404).json({ error: "not found" });
    const driversList = await db.select().from(drivers).where(eq(drivers.deliveryId, req.params.id));
    const tripsList = await db.select().from(trips).where(eq(trips.deliveryId, req.params.id));
    return res.json({ ...row, drivers: driversList, trips: tripsList });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PUT /api/delivery-companies/:id
router.put("/delivery-companies/:id", async (req, res) => {
  try {
    const { password, id, createdAt, ...data } = req.body;
    const [updated] = await db.update(deliveryCompanies).set(data).where(eq(deliveryCompanies.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/delivery-companies (admin creates)
router.post("/delivery-companies", async (req, res) => {
  try {
    const { id, name, city, phone, password, email, address, license, plan } = req.body;
    if (!id || !name || !phone) return res.status(400).json({ error: "id, name, phone required" });
    const [created] = await db.insert(deliveryCompanies).values({ id, name, city, phone, password: password || "123456", email, address, license, plan: plan || "free" }).returning();
    return res.status(201).json(created);
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "رقم الهاتف أو المعرّف مسجّل مسبقاً" });
    return res.status(500).json({ error: "server error" });
  }
});

// ── DRIVERS ─────────────────────────────────────────────────────
// GET /api/delivery-companies/:id/drivers
router.get("/delivery-companies/:id/drivers", async (req, res) => {
  try {
    const rows = await db.select().from(drivers).where(eq(drivers.deliveryId, req.params.id));
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/delivery-companies/:id/drivers
router.post("/delivery-companies/:id/drivers", async (req, res) => {
  try {
    const { name, phone, vehicle, status } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "name and phone required" });
    const [created] = await db.insert(drivers).values({ deliveryId: req.params.id, name, phone, vehicle, status: status || "offline" }).returning();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PUT /api/drivers/:driverId
router.put("/drivers/:driverId", async (req, res) => {
  try {
    const { id, createdAt, ...data } = req.body;
    const [updated] = await db.update(drivers).set(data).where(eq(drivers.id, Number(req.params.driverId))).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/drivers/:driverId
router.delete("/drivers/:driverId", async (req, res) => {
  try {
    await db.update(drivers).set({ active: false }).where(eq(drivers.id, Number(req.params.driverId)));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// ── TRIPS ─────────────────────────────────────────────────────
// GET /api/delivery-companies/:id/trips
router.get("/delivery-companies/:id/trips", async (req, res) => {
  try {
    const rows = await db.select().from(trips).where(eq(trips.deliveryId, req.params.id));
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/delivery-companies/:id/trips
router.post("/delivery-companies/:id/trips", async (req, res) => {
  try {
    const { driverId, orderId, pickupAddress, dropAddress, fee, distanceKm } = req.body;
    const [created] = await db.insert(trips).values({
      deliveryId: req.params.id, driverId, orderId, pickupAddress, dropAddress, fee, distanceKm, status: "pending"
    }).returning();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PATCH /api/trips/:tripId/status
router.patch("/trips/:tripId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const completedAt = status === "completed" ? new Date() : undefined;
    const update: any = { status };
    if (completedAt) update.completedAt = completedAt;
    const [updated] = await db.update(trips).set(update).where(eq(trips.id, Number(req.params.tripId))).returning();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
