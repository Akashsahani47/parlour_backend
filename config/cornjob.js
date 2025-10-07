import cron from "node-cron";
import { sendBookingEmail } from "./nodemailer.js";
import BookingModel from "../models/booking.js";


// 🕒 Run every 1 minute
cron.schedule("* * * * * *", async () => {
  try {
    console.log("⏳ Checking for pending bookings to confirm...");
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // 1️⃣ Find and confirm pending bookings older than 1 minute
    const pendingBookings = await BookingModel.find({
      status: "pending",
      createdAt: { $lte: oneMinuteAgo },
    })
      .populate("user", "name email")
      .populate("service", "name");

    if (pendingBookings.length > 0) {
      console.log(`📧 Found ${pendingBookings.length} pending bookings. Sending emails...`);

      for (let booking of pendingBookings) {
        try { 
          await sendBookingEmail(booking);
          booking.status = "confirmed";
          await booking.save();
          console.log(`✅ Booking ${booking._id} marked as confirmed and email sent.`);
        } catch (emailErr) {
          console.error(`❌ Failed to send email for booking ${booking._id}:`, emailErr.message);
        }
      }
    } else {
      console.log("✅ No pending bookings right now.");
    }

    // 2️⃣ Mark bookings whose endTime has passed as completed
    console.log("🏁 Checking for bookings to mark as completed...");
    const now = new Date();

    const result = await BookingModel.updateMany(
      { endTime: { $lte: now }, status: { $in: ["pending", "confirmed"] } },
      { $set: { status: "completed" } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ ${result.modifiedCount} bookings marked as completed.`);
    } else {
      console.log("✅ No bookings to mark as completed right now.");
    }

  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});
