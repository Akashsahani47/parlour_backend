import cron from "node-cron";
import { makeCall, sendOwnerSMS } from "./Twilio.js";
import BookingModel from "../models/booking.js";
import { sendBookingEmail } from "./nodemailer.js";
import { notifyOwnerSMS } from "./fastsms.js";



import cron from "node-cron";
import BookingModel from "./models/booking.js";
import { sendBookingEmail } from "./utils/email.js";

// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏳ Checking for pending and completed bookings...");

    const now = new Date();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // 1️⃣ Find pending bookings older than 1 min
    const pendingBookings = await BookingModel.find({
      status: "pending",
      createdAt: { $lte: oneMinuteAgo }
    })
      .populate("user", "name email")
      .populate("service", "name");

    // 2️⃣ For each pending booking → send email and mark as confirmed
    if (pendingBookings.length > 0) {
      console.log(`📩 Found ${pendingBookings.length} pending bookings. Sending emails...`);
      for (let booking of pendingBookings) {
        await sendBookingEmail(booking);

        await BookingModel.findByIdAndUpdate(booking._id, {
          $set: { status: "confirmed" }
        });
      }
      console.log(`✅ ${pendingBookings.length} bookings marked as confirmed.`);
    } else {
      console.log("✅ No pending bookings to confirm right now.");
    }

    // 3️⃣ Mark completed bookings (endTime passed)
    const completedResult = await BookingModel.updateMany(
      { endTime: { $lte: now }, status: { $in: ["pending", "confirmed"] } },
      { $set: { status: "completed" } }
    );

    if (completedResult.modifiedCount > 0) {
      console.log(`🏁 ${completedResult.modifiedCount} bookings marked as completed.`);
    }

  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});
