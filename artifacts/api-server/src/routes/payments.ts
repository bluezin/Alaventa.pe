import { Router } from "express";
import { db, listingsTable, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { FEATURE_PRICE } from "@workspace/api-zod";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

const MP_API = "https://api.mercadopago.com";

const USE_SANDBOX = process.env.MERCADO_PAGO_SANDBOX === "true";

/**
 * Mercado Pago fetch seguro
 */
function mpFetch(path: string, options?: RequestInit) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN not set");

  return fetch(`${MP_API}${path}`, {
    method: options?.method ?? "POST",
    body: options?.body,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
}

async function mpJson<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await mpFetch(path, {
    method: body ? "POST" : "GET",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json: any = await res.json();

  if (!res.ok) {
    const err = new Error(json.message ?? "MP API error");
    (err as any).status = res.status;
    (err as any).mpError = json;
    throw err;
  }

  return json;
}

/**
 * CREATE PREFERENCE
 */
router.post("/create-preference", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const { listingId } = req.body;

    if (!listingId) {
      res.status(400).json({ error: "listingId is required" });
      return;
    }

    const listings = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, listingId))
      .limit(1);

    if (listings.length === 0) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const listing = listings[0];

    if (listing.userId !== userId) {
      res.status(403).json({ error: "Not your listing" });
      return;
    }

    if (listing.isFeatured) {
      res.status(400).json({ error: "Already featured" });
      return;
    }

    const externalReference = `FEATURE_${listingId}_${Date.now()}`;

    const backUrls = {
      success: `${BACKEND_URL}/api/payments/success`,
      failure: `${BACKEND_URL}/api/payments/failure`,
      pending: `${BACKEND_URL}/api/payments/pending`,
    };

    const result = await mpJson<{
      id: string;
      init_point: string;
      sandbox_init_point: string;
    }>("/checkout/preferences", {
      items: [
        {
          id: String(listingId),
          title: `Destacar anuncio: ${listing.title}`,
          description: `Destacar "${listing.title}" por 30 días`,
          quantity: 1,
          unit_price: FEATURE_PRICE,
          currency_id: "PEN",
        },
      ],

      external_reference: externalReference,
      auto_return: "approved",
      back_urls: backUrls,
      notification_url: `${BACKEND_URL}/api/payments/webhook`,
    });

    if (!result.id || !(USE_SANDBOX ? result.sandbox_init_point : result.init_point)) {
      res.status(500).json({ error: "Failed to create MP preference" });
      return;
    }

    await db.insert(paymentsTable).values({
      listingId,
      userId,
      amount: String(FEATURE_PRICE) + ".00",
      status: "pending",
      mpPreferenceId: result.id,
      externalReference,
    });

    res.json({
      initPoint: USE_SANDBOX ? result.sandbox_init_point : result.init_point,
      preferenceId: result.id,
    });
  } catch (err: any) {
    req.log.error({ err, mpError: err.mpError }, "Failed to create preference");
    console.error("MP ERROR DETALLADO:", JSON.stringify(err.mpError, null, 2));
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
      mpError: err.mpError,
    });
  }
});

/**
 * SUCCESS
 */
router.get("/success", async (req, res) => {
  try {
    const { payment_id, external_reference } = req.query as Record<
      string,
      string
    >;

    if (payment_id) {
      const payment = await mpJson<{ status: string; external_reference: string }>(`/v1/payments/${payment_id}`);
      const status = payment.status === "approved" ? "approved" : "rejected";

      await db
        .update(paymentsTable)
        .set({
          status,
          mpPaymentId: payment_id,
        })
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
            .set({
              isFeatured: true,
              featuredUntil,
            })
            .where(eq(listingsTable.id, listingId));

          res.redirect(
            `${FRONTEND_URL}/dashboard?payment=success&listingId=${listingId}`,
          );
          return;
        }
      }
    }

    res.redirect(`${FRONTEND_URL}/dashboard?payment=success`);
  } catch (err) {
    req.log.error(err, "Failed to process success");
    res.redirect(`${FRONTEND_URL}/dashboard?payment=error`);
  }
});

/**
 * FAILURE
 */
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

/**
 * PENDING
 */
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

/**
 * WEBHOOK
 */
router.post("/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment" && data?.id) {
      const paymentId = data.id;

      const payment = await mpJson<{ status: string; external_reference: string }>(`/v1/payments/${paymentId}`);

      const externalReference = payment.external_reference;

      if (!externalReference) {
        res.status(200).send();
        return;
      }

      const status = payment.status === "approved" ? "approved" : "rejected";

      await db
        .update(paymentsTable)
        .set({
          status,
          mpPaymentId: paymentId,
        })
        .where(eq(paymentsTable.externalReference, externalReference));

      if (status === "approved") {
        const paymentRecord = await db
          .select()
          .from(paymentsTable)
          .where(eq(paymentsTable.externalReference, externalReference))
          .limit(1);

        if (paymentRecord.length > 0) {
          const listingId = paymentRecord[0].listingId;

          const featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          await db
            .update(listingsTable)
            .set({
              isFeatured: true,
              featuredUntil,
            })
            .where(eq(listingsTable.id, listingId));
        }
      }
    }

    res.status(200).send();
  } catch (err) {
    req.log.error(err, "Failed to process webhook");
    res.status(200).send();
  }
});

export default router;
