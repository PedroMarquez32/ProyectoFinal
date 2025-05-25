const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get all transactions
router.get('/transactions', [auth, isAdmin], async (req, res) => {
  try {
    const { range } = req.query;
    let startDate;
    
    switch(range) {
      case 'last30':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const transactions = await stripe.charges.list({
      created: { gte: Math.floor(startDate.getTime() / 1000) },
      limit: 100
    });

    const formattedTransactions = transactions.data.map(t => ({
      id: t.id,
      amount: t.amount / 100,
      customer_name: t.billing_details.name,
      customer_email: t.billing_details.email,
      status: t.status,
      date: new Date(t.created * 1000),
      refunded: t.refunded
    }));

    const totalRevenue = formattedTransactions
      .filter(t => t.status === 'succeeded' && !t.refunded)
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      transactions: formattedTransactions,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error al obtener las transacciones' });
  }
});

// Process refund
router.post('/refund/:transactionId', [auth, isAdmin], async (req, res) => {
  try {
    const refund = await stripe.refunds.create({
      charge: req.params.transactionId
    });

    res.json(refund);
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Error al procesar el reembolso' });
  }
});

module.exports = router;