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


// export const getBookedSlots = async (req, res) => {
//   try {
//     const { date, service, startTime, endTime } = req.query;
    
//     if (!date || !service) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Date and service are required.' 
//       });
//     }

//     // Convert date string to start and end of day
//     const startDate = new Date(date);
//     const endDate = new Date(date);
//     endDate.setDate(endDate.getDate() + 1);

//     console.log('🔍 Checking slot availability for:', {
//       date,
//       service,
//       startTime,
//       endTime
//     });

//     // Find all bookings for that day and service
//     const bookings = await BookingModel.find({
//       service: service,
//       startTime: { $gte: startDate, $lt: endDate },
//       status: { $in: ['confirmed', 'pending'] }
//     }).select('startTime endTime').lean();

//     console.log('📅 Found bookings:', bookings.length);

//     // If user passed a specific slot, check for overlap
//     if (startTime && endTime) {
//       const requestedStart = new Date(startTime);
//       const requestedEnd = new Date(endTime);

//       console.log('⏰ Checking specific slot:', {
//         requestedStart: requestedStart.toISOString(),
//         requestedEnd: requestedEnd.toISOString()
//       });

//       const isSlotTaken = bookings.some(b => {
//         const bookedStart = new Date(b.startTime);
//         const bookedEnd = new Date(b.endTime);
        
//         console.log('📊 Comparing with booked slot:', {
//           bookedStart: bookedStart.toISOString(),
//           bookedEnd: bookedEnd.toISOString(),
//           overlap: requestedStart < bookedEnd && requestedEnd > bookedStart
//         });
        
//         return requestedStart < bookedEnd && requestedEnd > bookedStart;
//       });

//       console.log('🎯 Slot availability result:', isSlotTaken ? 'TAKEN' : 'AVAILABLE');

//       if (isSlotTaken) {
//         return res.status(200).json({
//           success: false,
//           message: '❌ Slot is not available.',
//           available: false
//         });
//       } else {
//         return res.status(200).json({
//           success: true,
//           message: '✅ Slot is available.',
//           available: true
//         });
//       }
//     }

//     // If no specific slot was requested, return all booked slots
//     const bookedSlots = bookings.map(b => ({
//       startTime: b.startTime,
//       endTime: b.endTime
//     }));

//     return res.status(200).json({
//       success: true,
//       bookedSlots,
//       message: '✅ Fetched booked slots successfully.'
//     });

//   } catch (error) {
//     console.error('❌ Error checking slot:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Internal server error.' 
//     });
//   }
// };