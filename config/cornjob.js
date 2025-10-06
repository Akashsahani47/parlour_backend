import cron from "node-cron";
import { makeCall, sendOwnerSMS } from "./Twilio.js";
import { sendBookingEmail } from "./nodemailer.js";
import { notifyOwnerSMS } from "./fastsms.js";
import BookingModel from "../models/booking.js";



// 1️⃣ Every second — confirm pending bookings older than 1 min
cron.schedule("* * * * * *", async () => {
  try {
    console.log("⏳ Checking for pending bookings to confirm...");

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const pendingBookings = await BookingModel.find({
      status: "pending",
      createdAt: { $lte: oneMinuteAgo }
    })
      .populate("user", "name email")
      .populate("service", "name");

    if (pendingBookings.length > 0) {
      console.log(`📩 Found ${pendingBookings.length} pending bookings. Sending emails...`);
      for (let booking of pendingBookings) {
        await sendBookingEmail(booking);

        await BookingModel.findByIdAndUpdate(booking._id, {
          $set: { status: "confirmed" }
        });

        console.log(`✅ Booking confirmed: ${booking.service.name} for ${booking.user.name}`);
      }
    }
  } catch (err) {
    console.error("❌ Error confirming pending bookings:", err.message);
  }
});

// 2️⃣ Every minute — mark completed bookings
cron.schedule("* * * * *", async () => {
  try {
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
    console.error("❌ Error completing bookings:", err.message);
  }
});