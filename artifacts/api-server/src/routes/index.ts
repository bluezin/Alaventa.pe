import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import listingsRouter from "./listings";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/categories", categoriesRouter);
router.use("/listings", listingsRouter);
router.use("/users", usersRouter);

export default router;
