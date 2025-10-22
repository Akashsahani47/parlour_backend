import UserModel from "../models/auth.js";
import BookingModel from "../models/booking.js";
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
      status = "pending"
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


export const getBookedSlots = async (req, res) => {
  try {
    const { date, service, startTime, endTime } = req.query;

    if (!service) {
      return res.status(400).json({
        success: false,
        message: "Service is required.",
      });
    }

    // ✅ When checking a specific slot (exactly like createBooking)
    if (startTime && endTime) {
      const requestedStart = new Date(startTime);
      const requestedEnd = new Date(endTime);

      // Defensive date check
      if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startTime or endTime format.",
        });
      }

      // Exact same overlap condition as createBooking
      const existingBooking = await BookingModel.findOne({
        service: service,
        startTime: { $lt: requestedEnd },
        endTime: { $gt: requestedStart },
        status: { $in: ["confirmed", "pending"] },
      }).select("startTime endTime");

      if (existingBooking) {
        return res.status(200).json({
          success: false,
          available: false,
          message: "❌ Slot is not available (already booked).",
          conflictSlot: existingBooking,
        });
      }

      return res.status(200).json({
        success: true,
        available: true,
        message: "✅ Slot is available.",
      });
    }

    // ✅ Otherwise fetch booked slots for a given day
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required when fetching all slots.",
      });
    }

    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

    const bookings = await BookingModel.find({
      service,
      startTime: { $lt: endOfDay },
      endTime: { $gt: startOfDay },
      status: { $in: ["confirmed", "pending"] },
    }).select("startTime endTime");

    const bookedSlots = bookings.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    }));

    return res.status(200).json({
      success: true,
      bookedSlots,
      message: "✅ Booked slots fetched successfully.",
    });
  } catch (error) {
    console.error("❌ Error in getBookedSlots:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getUserBookings = async (req, res) => {
  try {
    // ✅ 1. Get logged-in user ID
    const userID = req.user._id;

    // ✅ 2. Find all bookings of that user and populate related fields
    const bookings = await BookingModel.find({ user: userID })
      .populate("service")
      .populate("user");

    // ✅ 3. Send success response
    res.status(200).json({
      success: true,
      message: "User bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);

    // ❌ 4. Handle any errors
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message,
    });
  }
};
