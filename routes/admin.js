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
} from "../controllers/admin.js";
import { checkAdmin, isAuthenticated } from "../middleware/auth.js";

const router = express.Router(); 

router.use(isAuthenticated);
//router.use(checkAdmin)


router.post("/create", createService);
router.get("/getallService", getAllServices);
router.get("/:id", getServiceById);
router.put("/:id", updateServiceById);
router.delete("/:id", deleteServiceById);
router.delete("/delete", deleteAllServices);
router.get("/bookings", getAllBookings); 
router.get("/bookingCompleted", getCompletedBookings); 


export default router;
