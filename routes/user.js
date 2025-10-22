import express from "express";
import {
  getMyProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";
import { getServiceById } from "../controllers/admin.js";
import { getUserBookings } from "../controllers/booking.js";
import { updateUserProfile } from "../controllers/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/me", getMyProfile);
router.put("/update", updateProfile);
router.put("/change-password", changePassword);
router.get("/userBookings",getUserBookings)
router.get("/getServiceById/:id",getServiceById)
router.put("/profile", updateUserProfile);


export default router;
