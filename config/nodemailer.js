

import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "/Users/akashkumar/Desktop/demo/Parlour/backend/.env" });

export const sendBookingEmail = async (booking) => {
  try {
    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    if (booking.status !== "pending") {
      return { success: false, message: "No booking is in pending status" };
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Asha Beauty Parlour", email: "ak676964@gmail.com" },
        to: [{ email: booking.user.email }], // ✅ must be an array
        subject: "✅ Appointment Confirmed",
        htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background: #f8fafc; font-family: 'Inter', sans-serif; -webkit-text-size-adjust: 100%;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px 20px; text-align: center; color: white;">
      <div style="margin-bottom: 15px;">
        <div style="font-size: 40px; margin-bottom: 10px; text-align: center;">✨</div>
        <h1 style="margin: 0 0 8px 0; font-size: 24px; color: white; font-weight: 700;">Asha Beauty Parlour</h1>
        <p style="margin: 0; opacity: 0.8; color: white; font-size: 14px;">Professional Beauty Services</p>
      </div>
    </div>

    <!-- Status Banner -->
    <div style="background: linear-gradient(to right, #10b981, #34d399); padding: 16px; text-align: center; color: white;">
      <div style="display: block; text-align: center; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
        <span style="font-size: 16px; vertical-align: middle;">✓</span>
        APPOINTMENT CONFIRMED
      </div>
      <div style="font-size: 11px; margin-top: 4px; opacity: 0.9;">
        Booking ID: #${booking.id ? booking.id.slice(-8).toUpperCase() : 'ASH' + Date.now().toString().slice(-6)}
      </div>
    </div>

    <!-- Main Content -->
    <div style="padding: 25px 20px;">
      
      <!-- Greeting -->
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #1e293b; margin-bottom: 10px; font-size: 20px; font-weight: 600;">
          Thank You, ${booking.user.name}!
        </h2>
        <p style="color: #64748b; line-height: 1.5; margin: 0; font-size: 14px;">
          Your appointment has been confirmed. We look forward to providing you with exceptional service.
        </p>
      </div>

      <!-- Appointment Details Card -->
      <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
        <h3 style="color: #1e293b; margin-bottom: 18px; font-size: 16px; font-weight: 600; text-align: center;">
          Appointment Details
        </h3>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Service -->
          <div style="display: flex; align-items: center; padding: 12px 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
           
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
                Service
              </div>
              <div style="font-weight: 600; color: #1e293b; font-size: 14px;">
                ${booking.service.name}
              </div>
            </div>
          </div>

          <!-- Date & Time Container -->
          <div style="display: flex; gap: 12px;">
            <!-- Date -->
            <div style="flex: 1; display: flex; align-items: center; padding: 12px 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
             
              <div>
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
                  Date
                </div>
                <div style="font-weight: 600; color: #1e293b; font-size: 14px;">
                  ${new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            <!-- Time -->
            <div style="flex: 1; display: flex; align-items: center; padding: 12px 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
             
              <div>
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
                  Time
                </div>
                <div style="font-weight: 600; color: #1e293b; font-size: 14px;">
                  ${new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Important Information -->
      <div style="background: #fffbeb; border-radius: 10px; padding: 18px; margin-bottom: 20px; border: 1px solid #fcd34d;">
        <h3 style="color: #92400e; margin-bottom: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center;">
          <span style="margin-right: 6px;">ℹ️</span> Important Information
        </h3>
        <ul style="color: #92400e; margin: 0; padding-left: 18px; line-height: 1.5; font-size: 13px;">
          <li style="margin-bottom: 6px;">Please arrive 10-15 minutes before your appointment</li>
          <li style="margin-bottom: 6px;">Contact us immediately if you need to reschedule</li>
          <li style="margin-bottom: 0;">Mention any allergies or medical conditions to our staff</li>
        </ul>
      </div>

      <!-- Contact Information -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px;">
        <div style="flex: 1; text-align: center; padding: 16px; background: #f1f5f9; border-radius: 8px;">
          <div style="font-size: 20px; margin-bottom: 6px; text-align: center;">📍</div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Address</div>
          <div style="font-size: 11px; color: #1e293b; font-weight: 500;">
            Rati Nath Basu Path,<br>Shanti road
          </div>
        </div>
        
        <div style="flex: 1; text-align: center; padding: 16px; background: #f1f5f9; border-radius: 8px;">
          <div style="font-size: 20px; margin-bottom: 6px; text-align: center;">📞</div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Contact</div>
          <div style="font-size: 11px; color: #1e293b; font-weight: 500;">
            7903983741<br>info@ashabeauty.com
          </div>
        </div>
      </div>

      <!-- Final Message -->
      <div style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 10px; border: 1px solid #bbf7d0;">
        <h3 style="color: #166534; margin-bottom: 8px; font-size: 14px; font-weight: 600;">
          We Look Forward to Seeing You!
        </h3>
        <p style="color: #166534; margin: 0; font-size: 13px; line-height: 1.4;">
          Our team is committed to providing you with the highest quality service and care.
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #1e293b; padding: 25px 20px; text-align: center; color: white;">
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Asha Beauty Parlour</h3>
        <p style="margin: 0 0 15px 0; opacity: 0.7; font-size: 12px;">
          Professional Beauty & Wellness Services
        </p>
      </div>
      
      <div style="border-top: 1px solid #334155; padding-top: 15px;">
        <p style="margin: 0; font-size: 11px; opacity: 0.6; line-height: 1.4;">
          © 2025 Asha Beauty Parlour. All rights reserved.<br>
          This email was sent to you as a confirmation of your appointment.
        </p>
      </div>
    </div>

  </div>
</body>
</html>`
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_PASS, // ✅ use the API key here
        },
      }
    );

    console.log("✅ Email sent:", response.data);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.data || error.message);
    return { success: false, message: error.response?.data || error.message };
  }
};

