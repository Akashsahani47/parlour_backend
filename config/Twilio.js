import dotenv from "dotenv";
import twilio from 'twilio';
import Bookingmodel from '../models/booking.js';
import UserModel from "../models/auth.js";
import ServiceModel from "../models/service.js";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const makeCall = async () => {
  try {
    const booking = await Bookingmodel.findOne({ status: 'pending' });

    if (!booking) {
      return { success: false, message: 'No pending booking found.' };
    }

    if (!booking.userPhone) {
      return { success: false, message: 'Phone number not found in booking.' };
    }

    
    const user = await UserModel.findById(booking.user);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    
    const service = await ServiceModel.findById(booking.service);
    if (!service) {
      return { success: false, message: "Service not found" };
    }

   
    const call = await client.calls.create({
      to: booking.userPhone.toString(),
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml: `
        <Response>
          <Say voice="alice" language="en-IN">
            Hello ${user.name}, your booking of ${service.name} is confirmed at Asha Beauty Parlour at ${service.startTime}. Have a nice day.
          </Say>
        </Response>
      `
    });

    //  Update status
    booking.status = 'confirmed';
    await booking.save();

    return { success: true, message: 'Call made and booking confirmed.' };

  } catch (error) {
    console.error('Call failed:', error.message);
    return { success: false, error: error.message };
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
