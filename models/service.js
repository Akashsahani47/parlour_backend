import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  duration: { type: Number, default: 59 }, // minutes
  price: { type: Number, required: true, min: 0 },

  // Extra fields you may need
  category: { type: String, enum: ["Haircut", "Skin", "Makeup", "Nails", "HairStyling","Eyebrow","Facial","Other"], default: "Other" },
  image: { type: String },   // service image (for UI)
  isActive: { type: Boolean, default: true }, // show/hide service
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update `updatedAt`
serviceSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ServiceModel =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default ServiceModel;
