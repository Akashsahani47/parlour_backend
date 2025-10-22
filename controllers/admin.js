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