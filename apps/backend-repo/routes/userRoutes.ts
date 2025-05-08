import { Router } from "express";
import { updateUserData, fetchAllUsers } from "../controller/api";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/update-user-data", authMiddleware, updateUserData);
router.get("/fetch-user-data", authMiddleware, fetchAllUsers);

export default router;
