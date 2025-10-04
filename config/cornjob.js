import cron from "node-cron";
import { makeCall } from "./Twilio.js";
import BookingModel from "../models/booking.js";
import { sendBookingEmail } from "./nodemailer.js";

// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏳ Checking for pending bookings...");

    // Find all pending bookings older than 1 min
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const bookings = await BookingModel.find({
      status: "pending",
      createdAt: { $lte: oneMinuteAgo }
    })  
    .populate("user", "name email")  
    .populate("service", "name");
   console.log(bookings)
    if (bookings.length > 0) {
      console.log(`📞 Found ${bookings.length} pending bookings.`);
      for (let booking of bookings) {
        //await makeCall(booking);
        await sendBookingEmail(booking) // pass booking directly
      }
    } else {
      console.log("✅ No pending bookings right now....");
    }
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});
