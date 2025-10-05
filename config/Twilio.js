import dotenv from "dotenv";
import twilio from "twilio";
import Bookingmodel from "../models/booking.js";
import UserModel from "../models/auth.js";
import ServiceModel from "../models/service.js";

dotenv.config({ path: "./.env" }); // adjust path if needed

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  throw new Error("Twilio credentials are missing. Check your .env file.");
}

const client = twilio(accountSid, authToken);

export const makeCall = async () => {
  try {
    const booking = await Bookingmodel.findOne({ status: "pending" });
    if (!booking) return { success: false, message: "No pending booking found." };
    if (!booking.userPhone) return { success: false, message: "Booking has no phone number." };

    const user = await UserModel.findById(booking.user);
    if (!user) return { success: false, message: "User not found." };

    const service = await ServiceModel.findById(booking.service);
    if (!service) return { success: false, message: "Service not found." };

    // Ensure phone number is in E.164 format
    const toPhone = booking.userPhone.startsWith("+")
      ? booking.userPhone
      : `+91${booking.userPhone}`; // adjust country code if needed

    console.log(`Calling ${toPhone} from ${fromNumber}...`);

    const call = await client.calls.create({
      to: toPhone,
      from: fromNumber,
      twiml: `
        <Response>
          <Say voice="alice" language="en-IN">
            Hello ${user.name}, your booking of ${service.name} is confirmed at Asha Beauty Parlour at ${service.startTime}. Have a nice day.
          </Say>
        </Response>
      `,
    });

    console.log("Call SID:", call.sid);

    // Update booking status only if call succeeds
    booking.status = "confirmed";
    await booking.save();

    return { success: true, message: "Call made and booking confirmed." };

  } catch (error) {
    // Special message for trial accounts
    if (error.code === 21211 || error.code === 20003) {
      console.error("Twilio authentication/number error:", error);
      return {
        success: false,
        message: "Call failed. Check Twilio credentials or verify the phone number (trial accounts require verified numbers).",
        details: error,
      };
    }

    console.error("Call failed:", error);
    return { success: false, error: error.message || error };
  }
};



export const sendOwnerSMS = async () => {
  try {
    const booking = await Bookingmodel.findOne({ status: "pending" })
      .populate("user")
      .populate("service");

    if (!booking) return { success: false, message: "No pending booking found." };

    const ownerPhone = "+917903983741"; // ✅ Owner phone number in E.164 format
    const userName = booking.user?.name || "Customer";
    const userPhone = booking.userPhone || "N/A";
    const serviceName = booking.service?.name || "Service";
    const bookingDate = new Date(booking.startTime).toLocaleDateString("en-IN");
    const bookingTime = new Date(booking.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const smsBody = `
📅 *New Booking Confirmed*
👤 Name: ${userName}
📞 Phone: ${userPhone}
💅 Service: ${serviceName}
🕓 Time: ${bookingTime} on ${bookingDate}
📍 Asha Beauty Parlour
    `;

    // Send SMS to owner
    const message = await client.messages.create({
      body: smsBody,
      from: fromNumber, // your Twilio number
      to: ownerPhone,   // owner number
    });

    console.log("✅ SMS sent to owner:", message.sid);

    booking.status = "confirmed";
    await booking.save();

    return { success: true, message: "SMS sent to owner and booking confirmed." };

  } catch (error) {
    console.error("❌ Error sending SMS:", error);
    return { success: false, message: error.message };
  }
};

export const call = async (req, res) => {
  const result = await makeCall();
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
};
