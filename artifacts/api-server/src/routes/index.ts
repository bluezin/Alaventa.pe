import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import listingsRouter from "./listings";
import commentsRouter from "./comments";
import usersRouter from "./users";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/categories", categoriesRouter);
router.use("/listings", listingsRouter);
router.use("/listings/:listingId/comments", commentsRouter);
router.use("/users", usersRouter);
router.use("/payments", paymentsRouter);

export default router;
