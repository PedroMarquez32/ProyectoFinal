// backend/src/routes/payments.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const stripeService = require('../services/stripeService');

router.post('/create-intent', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking || booking.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const paymentIntent = await stripeService.createPaymentIntent(
      booking.id, 
      booking.total_price
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      await stripeService.confirmPayment(event.data.object.id);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;