import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "/Users/akashkumar/Desktop/demo/Parlour/backend/.env" });

const sendEmail = async () => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Asha Beauty Parlour", email: "ak676964@gmail.com" },
        to: [{ email: "akash.kumardeoghar26@gmail.com" }],
        subject: "✅ Appointment Confirmed",
        htmlContent: "<h1>Your appointment is confirmed!</h1><p>Thank you for choosing us.</p>",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_PASS,
        },
      }
    );

    console.log("✅ Email sent:", response.data);
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.data || error.message);
  }
};

sendEmail();
