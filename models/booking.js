// models/booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    userPhone: { 
      type: String, 
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    date: { type: Date, default: Date.now },
    status: { 
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "confirmed" // Changed from "pending" to "confirmed"
    },
    // NEW FIELDS ADDED
    paymentMethod: {
      type: String,
      enum: ["razorpay", "pay_after_service", "free"],
      default: "pay_after_service"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    totalAmount: {
      type: Number,
      required: true
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    razorpaySignature: {
      type: String
    }
  },
  { timestamps: true }
);

// Add useful indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ service: 1 });

const BookingModel = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default BookingModel;