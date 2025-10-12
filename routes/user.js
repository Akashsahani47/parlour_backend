import express from "express";
import {
  getMyProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";
import { getServiceById } from "../controllers/admin.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/me", getMyProfile);
router.put("/update", updateProfile);
router.put("/change-password", changePassword);

router.get("/getServiceById/:id",getServiceById)
export default router;
