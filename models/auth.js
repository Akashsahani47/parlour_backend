import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
   name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: Number, required: true, unique: true },
    type:{ type:String, enum:["user","admin"], default:"user"},
    otp:{type:Number , default: null},
    otpexpiresAt:{type:String , default:""},
    
  },
  {
    timestamps: true, 
  }
);


const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
