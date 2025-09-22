// import axios from 'axios';

// const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
// const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;

// export const sendWhatsAppMessage = async (toNumber, templateName, variables = []) => {
//   try {
//     const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

//     const data = {
//       messaging_product: "whatsapp",
//       to: toNumber,
//       type: "template",
//       template: {
//         name: templateName,
//         language: { code: "en_US" },
//         components: [
//           {
//             type: "body",
//             parameters: variables.map((v) => ({ type: "text", text: v })),
//           }
//         ]
//       }
//     };

//     await axios.post(url, data, {
//       headers: {
//         Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("✅ WhatsApp message sent to", toNumber);
//   } catch (err) {
//     console.error("❌ Failed to send WhatsApp message:", err.response?.data || err.message);
//   }
// };
