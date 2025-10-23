import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
  deleteAllServices,
  getAllBookings,
  getCompletedBookings,
  getAllCustomers,
  getCustomerById,
} from "../controllers/admin.js";
import { checkAdmin, isAuthenticated } from "../middleware/auth.js";


const router = express.Router(); 

router.use(isAuthenticated);
router.use(checkAdmin);

// ✅ CORRECT ORDER: Specific routes FIRST
router.post("/create", createService);
router.get("/getallService", getAllServices);
router.get("/bookings", getAllBookings); // ← MOVED UP
router.get("/bookingCompleted", getCompletedBookings); // ← MOVED UP
router.get("/customers", getAllCustomers);
router.delete("/delete", deleteAllServices);
// ✅ Parameter routes LAST
router.get('/customers/:id', getCustomerById);
router.get("/:id", getServiceById);
router.put("/:id", updateServiceById);
router.delete("/:id", deleteServiceById);

export default router;