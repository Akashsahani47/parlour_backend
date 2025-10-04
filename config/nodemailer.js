import dotenv from "dotenv";
import nodemailer from "nodemailer"
dotenv.config({ path: "./.env" }); // adjust path if needed
import { Resend } from "resend"
const resend  = new Resend(process.env.RESEND_API_KEY);


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
 auth:{
  user : process.env.GMAILAPI,
  pass : process.env.GMAILPASS
 }

})

export default transporter;



// Function to send booking confirmation email
export const sendBookingEmail = async (booking) => {
  try {
    
    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    if (booking.status !== "pending") {
      return { success: false, message: "No booking is in pending status" };
    }
   
    // Build email template
   await resend.emails.send({
  from: "Asha Beauty Parlour <onboarding@resend.dev>",
  to: booking.user.email,
  subject: `✅ Appointment Confirmed - ${booking.service.name} | Asha Beauty Parlour`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background: #f8fafc; font-family: 'Inter', sans-serif; -webkit-text-size-adjust: 100%;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 0;">
        
        <!-- Header -->
        <div style="background: #1e293b; padding: 40px 20px; text-align: center; color: white;">
          <div style="margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 10px; text-align: center;">✨</div>
            <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">Asha Beauty Parlour</h1>
            <p style="margin: 0; opacity: 0.8; font-size: 16px;">Professional Beauty Services</p>
          </div>
        </div>

        <!-- Status Banner -->
        <div style="background: #10b981; padding: 20px; text-align: center; color: white;">
          <div style="display: block; text-align: center; font-weight: 600; font-size: 14px;">
            <span style="font-size: 16px; vertical-align: middle;">✓</span>
            APPOINTMENT CONFIRMED
          </div>
          <div style="font-size: 12px; margin-top: 5px; opacity: 0.9;">
            Booking ID: #${booking.id ? booking.id.slice(-8).toUpperCase() : 'ASH' + Date.now().toString().slice(-6)}
          </div>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
          
          <!-- Greeting -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-bottom: 12px; font-size: 24px; font-weight: 600;">
              Thank You, ${booking.user.name}!
            </h2>
            <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 16px;">
              Your appointment has been confirmed. We look forward to providing you with exceptional service.
            </p>
          </div>

          <!-- Appointment Details Card -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 25px 20px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e293b; margin-bottom: 20px; font-size: 18px; font-weight: 600; text-align: center;">
              Appointment Details
            </h3>
            
            <div style="display: block; gap: 15px;">
              <!-- Service -->
              <div style="display: block; text-align: center; margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px;">
                
                <div>
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                    Service
                  </div>
                  <div style="font-weight: 600; color: #1e293b; font-size: 16px;">
                    ${booking.service.name}
                  </div>
                </div>
              </div>

              <!-- Date & Time Container -->
              <div style="display: block; gap: 15px;">
                <!-- Date -->
                <div style="display: block; text-align: center; margin-bottom: 15px; padding: 15px; background: white; border-radius: 8px;">
                 
                  <div>
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                      Date
                    </div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 16px;">
                      ${new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <!-- Time -->
                <div style="display: block; text-align: center; padding: 15px; background: white; border-radius: 8px;">
                  
                  <div>
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                      Time
                    </div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 16px;">
                      ${new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Important Information -->
          <div style="background: #fffbeb; border-radius: 8px; padding: 20px; margin-bottom: 25px; border: 1px solid #fcd34d;">
            <h3 style="color: #92400e; margin-bottom: 15px; font-size: 16px; font-weight: 600; text-align: center;">
              <span style="vertical-align: middle;">ℹ️</span> Important Information
            </h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Please arrive 10-15 minutes before your appointment</li>
              <li style="margin-bottom: 8px;">Contact us immediately if you need to reschedule</li>
              <li style="margin-bottom: 0;">Mention any allergies or medical conditions to our staff</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="display: block; gap: 15px; margin-bottom: 25px;">
            <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px; margin-bottom: 15px;">
              <div style="font-size: 24px; margin-bottom: 8px; text-align: center;">📍</div>
              <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Address</div>
              <div style="font-size: 12px; color: #1e293b; font-weight: 500;">
                Rati Nath Basu Path,Shanti road
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">
              <div style="font-size: 24px; margin-bottom: 8px; text-align: center;">📞</div>
              <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Contact</div>
              <div style="font-size: 12px; color: #1e293b; font-weight: 500;">
                7903983741<br>info@ashabeauty.com
              </div>
            </div>
          </div>

          <!-- Final Message -->
          <div style="text-align: center; padding: 25px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <h3 style="color: #166534; margin-bottom: 10px; font-size: 16px; font-weight: 600;">
              We Look Forward to Seeing You!
            </h3>
            <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.5;">
              Our team is committed to providing you with the highest quality service and care.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #1e293b; padding: 30px 20px; text-align: center; color: white;">
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Asha Beauty Parlour</h3>
            <p style="margin: 0 0 20px 0; opacity: 0.7; font-size: 14px;">
              Professional Beauty & Wellness Services
            </p>
          </div>
          
          <div style="border-top: 1px solid #334155; padding-top: 20px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.6; line-height: 1.5;">
              © 2025 Asha Beauty Parlour. All rights reserved.<br>
              This email was sent to you as a confirmation of your appointment.
            </p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `
   });
   
    

    // Update status
    console.log("Email send sussessfully and Booking confirmed")
    booking.status = "confirmed";
    await booking.save();

    return { success: true, message: "Email sent and booking confirmed" };

  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: error.message };
  }
};
