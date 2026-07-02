import { Router } from "express";
import { db, listingCommentsTable, usersTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateCommentBody } from "@workspace/api-zod";

const router = Router({ mergeParams: true });

async function enrichComments(comments: any[]) {
  if (comments.length === 0) return [];
  const userIds = [...new Set(comments.map((c) => c.userId))];
  const users: Record<string, any> = {};
  for (const uid of userIds) {
    const found = await db.select().from(usersTable).where(eq(usersTable.clerkId, uid)).limit(1);
    if (found.length > 0) users[uid] = found[0];
  }
  return comments.map((c) => ({
    ...c,
    userName: users[c.userId]?.name ?? "Usuario",
    userAvatarUrl: users[c.userId]?.avatarUrl ?? null,
    createdAt: c.createdAt?.toISOString() ?? "",
  }));
}

// GET /api/listings/:id/comments
router.get("/", async (req, res) => {
  try {
    const params = req.params as Record<string, string>;
    const query = req.query as Record<string, string>;
    const lid = parseInt(params.listingId);
    if (isNaN(lid)) {
      res.status(400).json({ error: "Invalid listing ID" });
      return;
    }
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(listingCommentsTable)
      .where(eq(listingCommentsTable.listingId, lid))
      .orderBy(desc(listingCommentsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(listingCommentsTable)
      .where(eq(listingCommentsTable.listingId, lid));

    const enriched = await enrichComments(rows);
    res.json({
      comments: enriched,
      total: Number(total),
      page,
      limit,
      hasMore: offset + limit < Number(total),
    });
  } catch (err) {
    req.log.error(err, "Failed to get comments");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/listings/:listingId/comments
router.post("/", requireAuth, async (req, res) => {
  try {
    const params = req.params as Record<string, string>;
    const lid = parseInt(params.listingId);
    if (isNaN(lid)) {
      res.status(400).json({ error: "Invalid listing ID" });
      return;
    }
    const userId = (req as any).userId as string;
    const parsed = CreateCommentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error });
      return;
    }
    const [comment] = await db
      .insert(listingCommentsTable)
      .values({
        listingId: lid,
        userId,
        content: parsed.data.content,
      })
      .returning();
    const [enriched] = await enrichComments([comment]);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error(err, "Failed to create comment");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/listings/:listingId/comments/:commentId
router.delete("/:commentId", requireAuth, async (req, res) => {
  try {
    const params = req.params as Record<string, string>;
    const lid = parseInt(params.listingId);
    const commentId = parseInt(params.commentId);
    if (isNaN(lid) || isNaN(commentId)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const userId = (req as any).userId as string;
    const rows = await db
      .select()
      .from(listingCommentsTable)
      .where(
        and(
          eq(listingCommentsTable.id, commentId),
          eq(listingCommentsTable.listingId, lid),
          eq(listingCommentsTable.userId, userId),
        ),
      )
      .limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Not found or unauthorized" });
      return;
    }
    await db.delete(listingCommentsTable).where(eq(listingCommentsTable.id, commentId));
    res.status(204).send();
  } catch (err) {
    req.log.error(err, "Failed to delete comment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
