import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { createRoomController, fetchOldChatsController, fetchRoomController, handleRoomRequestController, joinRoomController, searchRoomController } from "./room.controller";

const router = express.Router();

router.post("/rooms", authMiddleware, createRoomController);
router.get("/rooms", authMiddleware, fetchRoomController);
router.post("/rooms/:roomId/join", authMiddleware, joinRoomController);
router.get("/rooms/:roomId/requests", authMiddleware, fetchRoomController);
router.post("/rooms/:roomId/requests/handle", authMiddleware, handleRoomRequestController);
router.get("/rooms/:roomId/messages", authMiddleware, fetchOldChatsController);
router.get("/rooms/search", authMiddleware, searchRoomController);

export default router;