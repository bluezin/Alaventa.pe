import { Router } from "express";
import { db, usersTable, listingsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { UpdateMyProfileBody } from "@workspace/api-zod";

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

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const user = users[0];
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
    const { name, phone, avatarUrl } = parsed.data;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.clerkId, userId)).returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
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

router.get("/me/listings", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const listings = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.userId, userId))
      .orderBy(listingsTable.createdAt);
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
  const categories = await db.select().from((await import("@workspace/db")).categoriesTable);
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
