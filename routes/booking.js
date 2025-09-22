import express from "express"
import { createBooking } from "../controllers/booking.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.post('/newBooking',createBooking)

export default router;