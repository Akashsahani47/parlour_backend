import express from "express"
import { createBooking, updateBooking } from "../controllers/booking.js";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all routes
router.use(isAuthenticated);

// Booking routes
router.post('/newBooking', createBooking);
router.put('/updateBooking/:id', updateBooking);

// Payment routes
router.post('/payments/create-order', createOrder);
router.post('/payments/verify-payment', verifyPayment);

export default router;