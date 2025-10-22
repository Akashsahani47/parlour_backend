import jwt from "jsonwebtoken"
import UserModel from "../models/auth.js";

// export const isAuthenticated = async(req,res,next)=>{

//   const token = res.cookie.itoken;

//   try {
//     if(!token) {
//       return res.json({success:false,message:"Login First"})
//     }
//     const decode =  jwt.verify(token,process.env.JWT_SECRET)
    
//     const user = await UserModel.findById(decode.userId);

//     req.user = user;
//     req.userID = decode.userId;
    
//     next();
//   } catch (error) {
//     console.log("Error in the authenicaton function");
//     res.status(500).json({success:false,message:error.message})
//   }
// }

export const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      return res.status(401).json({ success: false, message: "Login First" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Decoded token:", decode);

    const user = await UserModel.findById(decode.userId); // <-- Check this key matches your token payload

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    req.userID = user._id;

    next();
  } catch (error) {
    console.log("Error in the authentication function");
    res.status(500).json({ success: false, message: error.message });
  }
};


export const  checkAdmin = async(req,res,next)=>{
  
  try {
    if(!req.user){
      return res.json({success:false,message:'Login First'})
    }
    if(req.user.type !== "admin"){
      return res.status(403).json({success:false,message:"Only Admin has Access"})
    }

    next();
  } catch (error) {
    console.log("Admin check failed",error.message);
    res.status(500).json({success:false,message:error.message})
  }
}