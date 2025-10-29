import express from "express"
import { createTestimonial, deleteTestimonial, getTestimonials } from "../controllers/testimonial.js";

const router = express.Router();

router.post('/createtestimonial', createTestimonial);
router.get('/show', getTestimonials);
router.delete('/delete/:id', deleteTestimonial);
export default router;