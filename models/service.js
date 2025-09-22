import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name:{type:String,required:true},
  duration:{type:Number,default:45},
  price:{type:Number,required:true}
})

const ServiceModel = mongoose.model.Services || mongoose.model("services",serviceSchema)

export default ServiceModel;