import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import pharmaciesRouter from "./pharmacies";
import warehousesRouter from "./warehouses";
import deliveryRouter from "./delivery";
import productsRouter from "./products";
import ordersRouter from "./orders";
import otpRouter from "./otp";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(pharmaciesRouter);
router.use(warehousesRouter);
router.use(deliveryRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(otpRouter);
router.use(adminRouter);

export default router;
