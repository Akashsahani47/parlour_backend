import express from "express";
import {
  getMyProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/me", getMyProfile);
router.put("/update", updateProfile);
router.put("/change-password", changePassword);

export default router;
