import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function testCall() {
  try {
    const call = await client.calls.create({
      to: "+91917903983741", // verified number in Twilio if trial account
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml: "<Response><Say>Hello world!</Say></Response>",
    });
    console.log("Call SID:", call.sid);
  } catch (err) {
    console.error("Twilio test call failed:", err);
  }
}

testCall();
