import UserModel from "../models/auth.js";
import Booking from "../models/booking.js";
import Service from "../models/service.js";

export const createBooking = async (req, res) => {
  try {
    const { 
      service, 
      startTime, 
      userPhone, 
      endTime,
      date,
      paymentMethod = "pay_after_service", 
      paymentStatus = "pending",
      status = "confirmed"
    } = req.body;
    const userId = req.user._id;

    if (!service || !startTime || !userPhone) {
      return res.status(400).json({
        success: false,
        message: "service, startTime and userPhone are required",
      });
    }

    // 🔍 Fetch the service
    const servic = await Service.findById(service);
    if (!servic) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // 🔍 Fetch user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 45 * 60 * 1000); // 45 minutes default

    // 🔍 Check for overlapping booking
    const existingBooking = await Booking.findOne({
      service: service,
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

    // Create booking
    const booking = await Booking.create({
      user: userId,
      userPhone: userPhone,
      service: service,
      startTime: start,
      endTime: end,
      date: date ? new Date(date) : start,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      totalAmount: servic.price,
      status: status
    });
        
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: booking,
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

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('service').populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: booking
    });

  } catch (error) {
    console.error("Update booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};