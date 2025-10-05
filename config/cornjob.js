import cron from "node-cron";
import { makeCall, sendOwnerSMS } from "./Twilio.js";
import BookingModel from "../models/booking.js";
import { sendBookingEmail } from "./nodemailer.js";
import { notifyOwnerSMS } from "./fastsms.js";



cron.schedule("* * * * *", async () => {
  try {
    console.log("⏳ Checking for pending bookings and completed bookings...");

    const now = new Date();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // 1️⃣ Handle pending bookings older than 1 min (for notifications)
    const pendingBookings = await BookingModel.find({
      status: "pending",
      createdAt: { $lte: oneMinuteAgo }
    })
      .populate("user", "name email")
      .populate("service", "name");

    if (pendingBookings.length > 0) {
      console.log(`📞 Found ${pendingBookings.length} pending bookings for notifications.`);
      for (let booking of pendingBookings) {
        await sendBookingEmail(booking);
        // Add other notifications if needed, e.g., SMS or owner alerts
      }
    } else {
      console.log("✅ No pending bookings for notifications right now.");
    }

    // 2️⃣ Update bookings whose endTime has passed to 'completed'
    const updateResult = await BookingModel.updateMany(
      { endTime: { $lte: now }, status: { $in: ["pending", "confirmed"] } },
      { $set: { status: "completed" } }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ Updated ${updateResult.modifiedCount} bookings to completed.`);
    }

  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});