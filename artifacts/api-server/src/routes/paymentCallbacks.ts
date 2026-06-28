import { Router } from "express";
import { db, listingsTable, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { mpJson } from "../lib/mp";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

router.get("/success", async (req, res) => {
  try {
    const { payment_id, external_reference } = req.query as Record<string, string>;

    if (payment_id) {
      const payment = await mpJson<{ status: string; external_reference: string }>(`/v1/payments/${payment_id}`);
      const status = payment.status === "approved" ? "approved" : "rejected";

      await db
        .update(paymentsTable)
        .set({ status, mpPaymentId: payment_id })
        .where(eq(paymentsTable.externalReference, external_reference));

      if (status === "approved" && external_reference) {
        const paymentRecord = await db
          .select()
          .from(paymentsTable)
          .where(eq(paymentsTable.externalReference, external_reference))
          .limit(1);

        if (paymentRecord.length > 0) {
          const listingId = paymentRecord[0].listingId;
          const featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          await db
            .update(listingsTable)
            .set({ isFeatured: true, featuredUntil })
            .where(eq(listingsTable.id, listingId));

          res.redirect(`${FRONTEND_URL}/dashboard?payment=success&listingId=${listingId}`);
          return;
        }
      }
    }

    res.redirect(`${FRONTEND_URL}/dashboard?payment=success`);
  } catch (err) {
    req.log?.error?.(err, "Failed to process success");
    res.redirect(`${FRONTEND_URL}/dashboard?payment=error`);
  }
});

router.get("/failure", async (req, res) => {
  const { external_reference } = req.query as Record<string, string>;

  if (external_reference) {
    await db
      .update(paymentsTable)
      .set({ status: "rejected" })
      .where(eq(paymentsTable.externalReference, external_reference));
  }

  res.redirect(`${FRONTEND_URL}/dashboard?payment=rejected`);
});

router.get("/pending", async (req, res) => {
  const { external_reference } = req.query as Record<string, string>;

  if (external_reference) {
    await db
      .update(paymentsTable)
      .set({ status: "pending" })
      .where(eq(paymentsTable.externalReference, external_reference));
  }

  res.redirect(`${FRONTEND_URL}/dashboard?payment=pending`);
});

export default router;
