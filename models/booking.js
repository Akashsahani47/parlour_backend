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
      default: "pending" 
    },
  },
  { timestamps: true }
);

// Add useful indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ service: 1 });

const BookingModel = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default BookingModel;
