import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { dashboardController, dashboardRecentRoomsController } from "./users.controller";

const router = express.Router();

router.get("/dashboard", authMiddleware, dashboardController);
router.get("/dashboard/recent-rooms", authMiddleware, dashboardRecentRoomsController);

export default router;