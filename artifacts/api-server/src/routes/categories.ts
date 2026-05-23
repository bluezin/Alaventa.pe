import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.name));
    res.json(categories);
  } catch (err) {
    req.log.error(err, "Failed to get categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
