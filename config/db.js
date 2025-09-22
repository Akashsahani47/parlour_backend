import mongoose from "mongoose";

export const connectDB = async ()=>{
 await mongoose.connect(process.env.MONGOURL,
  {dbName:"Parlour"})
 .then(()=>{
  console.log("MongoDb connected successfully....")
 }).catch((err)=>{
  console.log("MongoDb connection failed:",err.message)
  process.exit[1]
 })
}