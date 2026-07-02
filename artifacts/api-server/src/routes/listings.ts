import { Router } from "express";
import { db, listingsTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, and, or, ilike, desc, asc, sql, count, lte, gte } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import { CreateListingBody, UpdateListingBody } from "@workspace/api-zod";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2Bucket, getR2PublicUrl } from "../lib/r2";

const router = Router();

async function enrichListings(listings: any[]) {
  if (listings.length === 0) return [];
  const userIds = [...new Set(listings.map((l) => l.userId))];
  const users: Record<string, any> = {};
  for (const uid of userIds) {
    const found = await db.select().from(usersTable).where(eq(usersTable.clerkId, uid)).limit(1);
    if (found.length > 0) users[uid] = found[0];
  }
  const categories = await db.select().from(categoriesTable);
  const catMap: Record<number, string> = {};
  const slugMap: Record<number, string> = {};
  for (const c of categories) { catMap[c.id] = c.name; slugMap[c.id] = c.slug; }

  return listings.map((l) => {
    const user = users[l.userId];
    const phone = (l.userPhone ?? "").replace(/\D/g, "");
    const waPhone = phone.startsWith("51") ? phone : `51${phone}`;
    return {
      ...l,
      price: l.price != null ? Number(l.price) : null,
      categoryName: catMap[l.categoryId] ?? "Otros",
      categorySlug: slugMap[l.categoryId] ?? "",
      userName: user?.name ?? "Vendedor",
      userAvatarUrl: user?.avatarUrl ?? null,
      whatsappUrl: `https://wa.me/${waPhone}?text=Hola%2C+vi+tu+publicaci%C3%B3n+%22${encodeURIComponent(l.title)}%22+en+Mercado+Per%C3%BA+y+me+interesa.`,
      expiresAt: l.expiresAt?.toISOString() ?? "",
      createdAt: l.createdAt?.toISOString() ?? "",
      featuredUntil: l.featuredUntil?.toISOString() ?? null,
    };
  });
}

// Mark expired listings
async function markExpiredListings() {
  await db
    .update(listingsTable)
    .set({ status: "expired" })
    .where(and(eq(listingsTable.status, "active"), lte(listingsTable.expiresAt, new Date())));
}

// GET /api/listings
router.get("/", optionalAuth, async (req, res) => {
  try {
    await markExpiredListings();
    const { category, search, page = "1", limit = "20", featured } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(listingsTable.status, "active")];
    if (category) conditions.push(eq(categoriesTable.slug, category));
    if (search) {
      const term = `%${search}%`;
      conditions.push(or(ilike(listingsTable.title, term), ilike(listingsTable.description, term))!);
    }
    if (featured === "true") conditions.push(eq(listingsTable.isFeatured, true));

    const baseQuery = db
      .select({
        id: listingsTable.id,
        title: listingsTable.title,
        description: listingsTable.description,
        price: listingsTable.price,
        currency: listingsTable.currency,
        categoryId: listingsTable.categoryId,
        userId: listingsTable.userId,
        userPhone: listingsTable.userPhone,
        imageUrls: listingsTable.imageUrls,
        location: listingsTable.location,
        status: listingsTable.status,
        isFeatured: listingsTable.isFeatured,
        featuredUntil: listingsTable.featuredUntil,
        expiresAt: listingsTable.expiresAt,
        createdAt: listingsTable.createdAt,
        categorySlug: categoriesTable.slug,
      })
      .from(listingsTable)
      .leftJoin(categoriesTable, eq(listingsTable.categoryId, categoriesTable.id))
      .where(and(...conditions))
      .orderBy(desc(listingsTable.isFeatured), desc(listingsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const rows = await baseQuery;

    const [{ total }] = await db
      .select({ total: count() })
      .from(listingsTable)
      .leftJoin(categoriesTable, eq(listingsTable.categoryId, categoriesTable.id))
      .where(and(...conditions));

    const enriched = await enrichListings(rows);
    res.json({
      listings: enriched,
      total: Number(total),
      page: pageNum,
      limit: limitNum,
      hasMore: offset + limitNum < Number(total),
    });
  } catch (err) {
    req.log.error(err, "Failed to get listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/listings/stats/summary
router.get("/stats/summary", async (req, res) => {
  try {
    const [{ total }] = await db.select({ total: count() }).from(listingsTable).where(eq(listingsTable.status, "active"));
    const [{ featured }] = await db
      .select({ featured: count() })
      .from(listingsTable)
      .where(and(eq(listingsTable.status, "active"), eq(listingsTable.isFeatured, true)));
    const categories = await db.select().from(categoriesTable);
    const categoryCounts = await Promise.all(
      categories?.map(async (c) => {
        const [{ cnt }] = await db
          .select({ cnt: count() })
          .from(listingsTable)
          .where(and(eq(listingsTable.categoryId, c.id), eq(listingsTable.status, "active")));
        return { categoryId: c.id, categoryName: c.name, count: Number(cnt) };
      })
    );
    res.json({ totalListings: Number(total), featuredListings: Number(featured), categoryCounts });
  } catch (err) {
    req.log.error(err, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/listings/expiring-soon
router.get("/expiring-soon", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const listings = await db
      .select()
      .from(listingsTable)
      .where(
        and(
          eq(listingsTable.userId, userId),
          eq(listingsTable.status, "active"),
          lte(listingsTable.expiresAt, sevenDaysLater),
          gte(listingsTable.expiresAt, now)
        )
      );
    const enriched = await enrichListings(listings);
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "Failed to get expiring listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const rows = await db.select().from(listingsTable).where(eq(listingsTable.id, id)).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const [enriched] = await enrichListings(rows);
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "Failed to get listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/listings
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const parsed = CreateListingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error });
      return;
    }
    const { title, description, price, currency, categoryId, userPhone, imageUrls, location } = parsed.data;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const [listing] = await db
      .insert(listingsTable)
      .values({
        title,
        description,
        price: String(price),
        currency: currency ?? "PEN",
        categoryId,
        userId,
        userPhone,
        imageUrls: imageUrls ?? [],
        location,
        status: "active",
        isFeatured: false,
        expiresAt,
      })
      .returning();
    // Update category listing count
    await db
      .update(categoriesTable)
      .set({ listingCount: sql`${categoriesTable.listingCount} + 1` })
      .where(eq(categoriesTable.id, categoryId));
    const [enriched] = await enrichListings([listing]);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error(err, "Failed to create listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/listings/:id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const id = parseInt(`${req?.params?.id}`);
    const parsed = UpdateListingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const rows = await db.select().from(listingsTable).where(and(eq(listingsTable.id, id), eq(listingsTable.userId, userId))).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Not found or unauthorized" });
      return;
    }
    const updates: any = {};
    const d = parsed.data;
    if (d.title !== undefined) updates.title = d.title;
    if (d.description !== undefined) updates.description = d.description;
    if (d.price !== undefined) updates.price = d.price != null ? String(d.price) : null;
    if (d.categoryId !== undefined) updates.categoryId = d.categoryId;
    if (d.userPhone !== undefined) updates.userPhone = d.userPhone;
    if (d.imageUrls !== undefined) updates.imageUrls = d.imageUrls;
    if (d.location !== undefined) updates.location = d.location;
    const [updated] = await db.update(listingsTable).set(updates).where(eq(listingsTable.id, id)).returning();
    const [enriched] = await enrichListings([updated]);
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "Failed to update listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/listings/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const id = parseInt(`${req.params.id}`);
    const rows = await db.select().from(listingsTable).where(and(eq(listingsTable.id, id), eq(listingsTable.userId, userId))).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Not found or unauthorized" });
      return;
    }
    const listing = rows[0];
    const r2 = getR2Client();
    const bucket = getR2Bucket();
    const publicUrl = getR2PublicUrl();
    for (const url of listing.imageUrls) {
      const key = url.startsWith(publicUrl) ? url.slice(publicUrl.length + 1) : url;
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      } catch {
        // ignore if image already gone
      }
    }
    await db.update(listingsTable).set({ status: "deleted" }).where(eq(listingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err, "Failed to delete listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/listings/:id/renew
router.post("/:id/renew", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const id = parseInt(`${req.params.id}`);
    const rows = await db.select().from(listingsTable).where(and(eq(listingsTable.id, id), eq(listingsTable.userId, userId))).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Not found or unauthorized" });
      return;
    }
    const listing = rows[0];
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (listing.status === "active" && listing.expiresAt > sevenDaysLater) {
      res.status(400).json({ error: "Can only renew within 7 days of expiry" });
      return;
    }
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const [updated] = await db
      .update(listingsTable)
      .set({ status: "active", expiresAt: newExpiry })
      .where(eq(listingsTable.id, id))
      .returning();
    const [enriched] = await enrichListings([updated]);
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "Failed to renew listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
