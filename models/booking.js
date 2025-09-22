import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceModel", required: true },
    userPhone: { type: String, required: true },
    startTime: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }, 
    endTime:{type:String,required:true},
    status: { type: String,
      enum:["confirmed","completed","pending"],
      default:"pending" },
  },
  {
    timestamps: true, 
  }
);


const Bookingmodel = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Bookingmodel;
