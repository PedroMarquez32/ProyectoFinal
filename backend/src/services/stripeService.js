// backend/src/services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, Booking } = require('../models');

class StripeService {
  async createPaymentIntent(bookingId, amount) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amounts in cents
        currency: 'eur',
        metadata: { bookingId }
      });

      await Payment.create({
        booking_id: bookingId,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        status: 'PENDING'
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const payment = await Payment.findOne({
        where: { stripe_payment_intent_id: paymentIntentId },
        include: [{ model: Booking }]
      });

      if (!payment) throw new Error('Payment not found');

      await payment.update({ status: 'COMPLETED' });
      await payment.Booking.update({ status: 'CONFIRMED' });

      return payment;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();