import { TestimonialModel } from "../models/testimonial.js"

export const createTestimonial = async (req,res) =>{
  try {
    const {clientName, feedback,service, rating} = req.body;
    const newone = await TestimonialModel.create({
      clientName, feedback, service, rating
    })
    res.status(201).json({
      message:"Testimonial added successfully",
      testimonial: newone,
    })
  } catch (error) {
    res.status(500).json({
      message:"server error",
      error:error.message,
    })
  }
}

export const getTestimonials = async (req,res) =>{
  try {
    const testimonials = await TestimonialModel.find().sort({createdAt:-1});
    res.status(200).json({
      testimonials,
    })
  } catch (error) {
    res.status(500).json({
      message:"server error",
      error:error.message,
    })
  }
}

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTestimonial = await TestimonialModel.findByIdAndDelete(id);
    if (!deletedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

