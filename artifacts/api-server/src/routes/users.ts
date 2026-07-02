import { Router } from "express";
import { db, usersTable, listingsTable, categoriesTable } from "@workspace/db";
import { eq, and, count, ne, desc, sql } from "drizzle-orm";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { clerkClient } from "@clerk/express";
import { requireAuth } from "../middlewares/auth";
import { UpdateMyProfileBody } from "@workspace/api-zod";
import { getR2Client, getR2Bucket, getR2PublicUrl } from "../lib/r2";

const router = Router();

// Upsert user profile (called on login)
async function ensureUser(clerkId: string, name: string, email: string, avatarUrl?: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing.length === 0) {
    const [user] = await db.insert(usersTable).values({
      clerkId,
      name: name || "Usuario",
      email,
      avatarUrl: avatarUrl ?? null,
    }).returning();
    return user;
  }
  return existing[0];
}

// Auto-create the local user record from Clerk data on first /me hit, so the
// frontend doesn't need to explicitly call the sync endpoint after login.
async function getOrCreateMe(clerkId: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing.length > 0) return existing[0];

  const clerkUser = await clerkClient.users.getUser(clerkId);
  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  return ensureUser(clerkId, fullName || clerkUser.username || "Usuario", primaryEmail, clerkUser.imageUrl);
}

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const user = await getOrCreateMe(userId);
    const [{ value: activeCount }] = await db
      .select({ value: count() })
      .from(listingsTable)
      .where(and(eq(listingsTable.userId, userId), eq(listingsTable.status, "active")));
    res.json({ ...user, activeListingsCount: Number(activeCount) });
  } catch (err) {
    req.log.error(err, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const parsed = UpdateMyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error });
      return;
    }
    await getOrCreateMe(userId);
    const { name, phone, avatarUrl } = parsed.data;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatarUrl !== undefined) {
      const [current] = await db
        .select({ avatarUrl: usersTable.avatarUrl })
        .from(usersTable)
        .where(eq(usersTable.clerkId, userId))
        .limit(1);
      if (current?.avatarUrl) {
        const r2PublicUrl = getR2PublicUrl();
        if (current.avatarUrl.startsWith(r2PublicUrl)) {
          const key = current.avatarUrl.replace(`${r2PublicUrl}/`, "");
          getR2Client()
            .send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }))
            .catch(() => {});
        }
      }
      updates.avatarUrl = avatarUrl;
    }
    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.clerkId, userId)).returning();
    const [{ value: activeCount }] = await db
      .select({ value: count() })
      .from(listingsTable)
      .where(and(eq(listingsTable.userId, userId), eq(listingsTable.status, "active")));
    res.json({ ...updated, activeListingsCount: Number(activeCount) });
  } catch (err) {
    req.log.error(err, "Failed to update profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/me/sync", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const { name, email, avatarUrl } = req.body;
    const user = await ensureUser(userId, name || "Usuario", email || "", avatarUrl);
    res.json(user);
  } catch (err) {
    req.log.error(err, "Failed to sync user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/me/accept-terms", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const [updated] = await db
      .update(usersTable)
      .set({ termsAcceptedAt: new Date() })
      .where(eq(usersTable.clerkId, userId))
      .returning();
    res.json({ accepted: true, termsAcceptedAt: updated.termsAcceptedAt });
  } catch (err) {
    req.log.error(err, "Failed to accept terms");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me/listings", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const listings = await db
      .select()
      .from(listingsTable)
      .where(and(eq(listingsTable.userId, userId), ne(listingsTable.status, "deleted")))
      .orderBy(
        desc(listingsTable.isFeatured),
        sql`CASE WHEN ${listingsTable.status} = 'active' THEN 0 WHEN ${listingsTable.status} = 'expired' THEN 1 ELSE 2 END`,
        desc(listingsTable.createdAt),
      );
    const enriched = await enrichListings(listings);
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "Failed to get my listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId/listings", async (req, res) => {
  try {
    const { userId } = req.params;
    const listings = await db
      .select()
      .from(listingsTable)
      .where(and(eq(listingsTable.userId, userId), eq(listingsTable.status, "active")))
      .orderBy(listingsTable.createdAt);
    const enriched = await enrichListings(listings);
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "Failed to get user listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

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
  for (const c of categories) catMap[c.id] = c.name;

  return listings.map((l) => {
    const user = users[l.userId];
    const phone = l.userPhone?.replace(/\D/g, "") || "";
    const waPhone = phone.startsWith("51") ? phone : `51${phone}`;
    return {
      ...l,
      price: l.price != null ? Number(l.price) : null,
      categoryName: catMap[l.categoryId] ?? "Otros",
      userName: user?.name ?? "Vendedor",
      userAvatarUrl: user?.avatarUrl ?? null,
      whatsappUrl: `https://wa.me/${waPhone}?text=Hola%2C+vi+tu+publicaci%C3%B3n+%22${encodeURIComponent(l.title)}%22+en+Mercado+Per%C3%BA+y+me+interesa.`,
      expiresAt: l.expiresAt?.toISOString() ?? "",
      createdAt: l.createdAt?.toISOString() ?? "",
      featuredUntil: l.featuredUntil?.toISOString() ?? null,
    };
  });
}

export { enrichListings };
export default router;
