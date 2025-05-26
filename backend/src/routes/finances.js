const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { Payment, Booking, User, Trip } = require('../models');
const { Op } = require('sequelize');

// Get all transactions
router.get('/transactions', [auth, isAdmin], async (req, res) => {
  try {
    const { range } = req.query;
    let startDate = new Date();
    
    switch(range) {
      case 'last30':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'last90':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const payments = await Payment.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      include: [{
        model: Booking,
        include: [
          { model: User, attributes: ['username', 'email'] },
          { model: Trip, attributes: ['title'] }
        ]
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedTransactions = payments.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount),
      status: payment.status.toLowerCase(),
      customer_name: payment.Booking?.User?.username || 'Usuario no disponible',
      customer_email: payment.Booking?.User?.email || 'Email no disponible',
      trip_title: payment.Booking?.Trip?.title || 'Viaje no disponible',
      date: payment.createdAt,
      booking_id: payment.booking_id
    }));

    const totalRevenue = formattedTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      transactions: formattedTransactions,
      totalRevenue
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al obtener las transacciones' });
  }
});

// Update payment status
router.patch('/transactions/:id/status', [auth, isAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    await payment.update({ 
      status,
      payment_date: status === 'COMPLETED' ? new Date() : null
    });

    // Si el pago se completa, actualizar también el estado de la reserva
    if (status === 'COMPLETED') {
      await Booking.update(
        { status: 'CONFIRMED' },
        { where: { id: payment.booking_id } }
      );
    } else if (status === 'CANCELLED') {
      await Booking.update(
        { status: 'CANCELLED' },
        { where: { id: payment.booking_id } }
      );
    }

    res.json(payment);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del pago' });
  }
});

module.exports = router;