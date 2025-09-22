import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  server:"gmail",
 auth:{
  user : process.env.GMAILAPI,
  pass : process.env.GMAILPASS
 }

})

export default transporter;