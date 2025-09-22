import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js";
import authRouters from "./routes/auth.js";
import adminRouters from "./routes/admin.js"
import bookingRouters from "./routes/booking.js"
import userRoutes from "./routes/user.js"
import cookieParser from "cookie-parser";
import cors from "cors"
//import voiceRoute from './routes/voiceRoute.js';
dotenv.config();
 

const server = express();

connectDB();
const allowedOrigin =   process.env.NEXT_AUTH

server.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
server.use(express.json());
server.use(cookieParser());

console.log(allowedOrigin)


server.get('/',(req,res)=>{
  res.json({success:false,message:"Server is working"})
})
server.use('/api/auth',authRouters);
server.use('/api/admin',adminRouters);
server.use('/api/booking',bookingRouters);
server.use('/api/user',userRoutes)

const PORT = process.env.PORT || 4000;
server.listen(PORT,()=>{
console.log(`Server is running at the port http://localhost:${PORT} `)
})

