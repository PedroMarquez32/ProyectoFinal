// backend/src/routes/payments.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const { Booking } = require('../models');

router.post('/create-intent', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findOne({
      where: { 
        id: bookingId,
        user_id: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total_price * 100), // Convertir a céntimos
      currency: 'eur',
      metadata: {
        bookingId: booking.id,
        userId: req.user.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error al procesar el pago' });
  }
});

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    try {
      await Booking.update(
        { status: 'CONFIRMED' },
        { where: { id: bookingId } }
      );
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  }

  res.json({ received: true });
});

module.exports = router;