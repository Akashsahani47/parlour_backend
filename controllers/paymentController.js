import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/booking.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
console.log('Testing Razorpay Configuration...');
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID);
    console.log('Key Secret Length:', process.env.RAZORPAY_KEY_SECRET?.length);
    

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', service } = req.body;

    if (!amount || !service) {
      return res.status(400).json({
        success: false,
        message: 'Amount and service are required'
      });
    }

    const options = {
      amount: Math.round(amount), // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        service: service,
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// Verify Payment and Update Booking
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment details'
      });
    }

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      let booking;
      
      if (bookingId) {
        // Update existing booking
        booking = await Booking.findByIdAndUpdate(
          bookingId,
          {
            paymentStatus: 'paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: 'confirmed'
          },
          { new: true }
        ).populate('service').populate('user');
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        booking: booking
      });
    } else {
      // Update booking status to failed
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'failed'
        });
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    
    // Update booking status to failed in case of error
    if (req.body.bookingId) {
      await Booking.findByIdAndUpdate(req.body.bookingId, {
        paymentStatus: 'failed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};