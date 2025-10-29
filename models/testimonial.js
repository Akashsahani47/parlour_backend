import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  clientName:{ type: String, required:true, trim:true},
  feedback: {type:String, required:true, trim:true},
  service: {type:String, required:true,enum: ["Haircut", "Skin", "Makeup", "Nails", "HairStyling","Eyebrow","Facial","Other"], default: "Other"},
  rating: {type:Number, required:true,min:1,max:5},

},{timestamps:true}
);

export const TestimonialModel = mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);