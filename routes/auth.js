import express from "express"
import { checking, login, logout, signup } from "../controllers/auth.js"
import { call } from "../config/Twilio.js";


const router = express.Router();

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
router.post("/call",call);
router.get("/me",checking)

export default router;