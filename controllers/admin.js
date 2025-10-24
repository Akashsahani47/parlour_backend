import UserModel from "../models/auth.js";
import BookingModel from "../models/booking.js";
import ServiceModel from "../models/service.js";

// 1. Create Service
export const createService = async (req, res) => {
  try {
    const { name, description, duration, price, category, image } = req.body;

    // Basic validation
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and price are required.",
      });
    }

    const newService = new ServiceModel({
      name: name.trim(),
      description: description.trim(),
      duration,
      price,
      category,
      image,
    });

    await newService.save();

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("❌ Error in createService:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// 2. Get All Services
export const getAllServices = async (req, res) => {
  try {
    const services = await ServiceModel.find();
    res.status(200).json({ success: true, services });
  } catch (error) {
    console.error("Error in getAllServices:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Service by ID
export const getServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await ServiceModel.findById(id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, service });
  } catch (error) {
    console.error("Error in getServiceById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Service by ID
export const updateServiceById = async (req, res) => {
  const { id } = req.params;
  const { name, duration, price } = req.body;

  try {
    const updatedService = await ServiceModel.findByIdAndUpdate(
      id,
      { name, duration, price },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, message: "Service updated successfully", service: updatedService });
  } catch (error) {
    console.error("Error in updateServiceById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete Service by ID
export const deleteServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedService = await ServiceModel.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, message: "Service deleted successfully", service: deletedService });
  } catch (error) {
    console.error("Error in deleteServiceById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Delete All Services
export const deleteAllServices = async (req, res) => {
  try {
    const result = await ServiceModel.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All services deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in deleteAllServices:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// show All booking
export const getAllBookings = async (req, res) => {
  try {
    console.log('Admin: Fetching all bookings...');

    const bookings = await BookingModel.find()
      .populate('user', 'name email')
      .populate('service', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All bookings fetched successfully",
      bookings: bookings || [],
    });
  } catch (error) {
    console.log("Error in getAllBookings controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching bookings",
    });
  }
};







export const getCompletedBookings = async (req, res) => {
  try {
    const completedBookings = await BookingModel.find({ status: "completed" })
      .populate("user", "name email")
      .populate("service", "name price duration");

    res.status(200).json({
      success: true,
      message: "Completed bookings fetched successfully",
      data: completedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch completed bookings",
      error: error.message,
    });
  }
};


export const getAllCustomers = async (req, res) => {
  try {
    const customers = await UserModel.find()
      .select('name email phone createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await UserModel.findById(id)
      .select('name email phone createdAt');
    
    const orders = await BookingModel.find({ user: id })
      .populate('service', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customer,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






// Get all payments with filters
export const getAllPayments = async (req, res) => {
  try {
    const { paymentMethod, paymentStatus, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Apply filters if provided
    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    const skip = (page - 1) * limit;
    
    const payments = await BookingModel.find(filter)
      .populate('user', 'name email phoneNo')
      .populate('service', 'name price duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BookingModel.countDocuments(filter);
    
    // Calculate total earnings
    const totalEarnings = await BookingModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const earnings = totalEarnings.length > 0 ? totalEarnings[0].total : 0;

    res.status(200).json({
      success: true,
      payments,
      total,
      earnings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments data'
    });
  }
};

// Update payment status (mark as paid for offline payments)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required'
      });
    }

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const payment = await BookingModel.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    ).populate('user', 'name email phoneNo')
     .populate('service', 'name price duration');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status'
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const stats = await BookingModel.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { 
            $sum: { 
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] 
            } 
          },
          totalBookings: { $sum: 1 },
          paidBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          failedBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
          },
          razorpayEarnings: {
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ['$paymentStatus', 'paid'] },
                  { $eq: ['$paymentMethod', 'razorpay'] }
                ]}, 
                '$totalAmount', 
                0 
              ] 
            }
          },
          offlineEarnings: {
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ['$paymentStatus', 'paid'] },
                  { $eq: ['$paymentMethod', 'pay_after_service'] }
                ]}, 
                '$totalAmount', 
                0 
              ] 
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalEarnings: 0,
      totalBookings: 0,
      paidBookings: 0,
      pendingBookings: 0,
      failedBookings: 0,
      razorpayEarnings: 0,
      offlineEarnings: 0
    };

    res.status(200).json({
      success: true,
      stats: result
    });

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics'
    });
  }
};