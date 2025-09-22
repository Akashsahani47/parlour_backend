// // voiceRoute.js
// import express from 'express';
// const router = express.Router();

// router.get('/voice', (req, res) => {
//   const message = req.query.msg || 'Hello, this is a test message from Akash.';

//   const twiml = `
//     <Response>
//       <Say voice="alice" language="en-US">${message}</Say>
//     </Response>
//   `;

//   res.set('Content-Type', 'text/xml');
//   res.send(twiml.trim());
// });

// export default router;
