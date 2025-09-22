import UserModel from "../models/auth.js";
import Booking from "../models/booking.js";
import Service from "../models/service.js";

export const createBooking = async (req, res) => {
  try {
    const { serviceId, startTime } = req.body;
    const userId = req.user._id;

    if (!serviceId || !startTime) {
      return res.status(400).json({
        success: false,
        message: "serviceId and startTime are required",
      });
    }

    // 🔍 Fetch the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // 🔍 Fetch user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 45 * 60 * 1000); // 45 minutes

    // 🔍 Check for overlapping booking
    const existingBooking = await Booking.findOne({
      service: serviceId,
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start },
        },
      ],
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked. Please choose another time.",
      });
    }

    //  Create booking
    const booking = await Booking.create({
      user: userId,
      userPhone: user.phoneNo,
      service: serviceId,
      startTime: start,
      endTime: end,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
