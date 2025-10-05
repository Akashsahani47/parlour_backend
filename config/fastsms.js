import axios from "axios";

// Owner's phone number
const ownerPhone = "+917903983741"; // include country code

export const notifyOwnerSMS = async (booking) => {
  try {
    if (!booking) {
      console.log("No booking provided to notifyOwnerSMS.");
      return;
    }

    const user = booking.user; // already populated in cron
    const service = booking.service;

    if (!user || !service) {
      console.log("User or Service data missing in booking.");
      return;
    }

    // Construct SMS text
    const message = `Booking Alert! ${user.name} has booked ${service.name} on ${new Date(booking.startTime).toLocaleString()}.\nPhone: ${booking.userPhone}`;

    // Fast2SMS API
    const url = "https://www.fast2sms.com/dev/bulkV2";
    const apiKey = process.env.FAST2SMS_API_KEY;

    const response = await axios.post(
      url,
      {
        route: "v3",
        sender_id: "FSTSMS", // ensure this is approved
        message: message,
        language: "english",
        flash: 0,
        numbers: [ownerPhone], // <-- MUST be an array
      },
      {
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SMS sent to owner:", response.data);

  } catch (error) {
    console.error("❌ Error sending SMS:", error.response?.data || error.message || error);
  }
};
