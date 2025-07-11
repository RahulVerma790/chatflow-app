import express from "express";
import { signinController, signupController } from "./auth.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signupController);
router.post("/signin", signinController);

export default router;
