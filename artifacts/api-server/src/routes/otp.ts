import { Router } from "express";
import { db, otpCodes } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

const router = Router();

// POST /api/otp/send
router.post("/otp/send", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone required" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 60 * 1000);
    await db.insert(otpCodes).values({ phone: phone.trim(), code, expiresAt });
    return res.json({ success: true, code });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/otp/verify
router.post("/otp/verify", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: "phone and code required" });
    const now = new Date();
    const rows = await db.select().from(otpCodes)
      .where(and(
        eq(otpCodes.phone, phone.trim()),
        eq(otpCodes.code, code.trim()),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, now)
      ));
    if (rows.length === 0) return res.status(400).json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, rows[0].id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
