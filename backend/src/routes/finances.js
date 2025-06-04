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
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: Booking,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'email']
            },
            {
              model: Trip,
              attributes: ['title']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedTransactions = payments.map(payment => {
      const plainPayment = payment.get({ plain: true });
      // Primero intentar obtener el usuario del pago directo, luego de la reserva
      const user = plainPayment.User || plainPayment.Booking?.User;
      
      return {
        id: plainPayment.id,
        amount: parseFloat(plainPayment.amount),
        status: plainPayment.status.toLowerCase(),
        customer_name: plainPayment.customer_name || user?.username || 'Usuario no disponible',
        customer_email: plainPayment.customer_email || user?.email || '',
        user_id: user?.id,
        booking_id: plainPayment.booking_id,
        trip_title: plainPayment.Booking?.Trip?.title || '',
        date: plainPayment.createdAt,
        User: user
      };
    });

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
    const payment = await Payment.findByPk(req.params.id, {
      include: [{
        model: Booking,
        include: [{
          model: User,
          attributes: ['username', 'email']
        }]
      }]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    await payment.update({ 
      status: status.toUpperCase(),
      payment_date: status.toUpperCase() === 'COMPLETED' ? new Date() : null
    });

    if (status.toUpperCase() === 'COMPLETED') {
      await Booking.update(
        { status: 'CONFIRMED' },
        { where: { id: payment.booking_id } }
      );
    } else if (status.toUpperCase() === 'CANCELLED') {
      await Booking.update(
        { status: 'CANCELLED' },
        { where: { id: payment.booking_id } }
      );
    } else if (status.toUpperCase() === 'PENDING') {
      await Booking.update(
        { status: 'PENDING' },
        { where: { id: payment.booking_id } }
      );
    }

    res.json(payment);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del pago' });
  }
});

// Update payment amount
router.patch('/transactions/:id/amount', [auth, isAdmin], async (req, res) => {
  try {
    const { amount } = req.body;
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    await payment.update({ amount });

    // Si hay una reserva asociada, actualizar su precio total
    if (payment.booking_id) {
      await Booking.update(
        { total_price: amount },
        { where: { id: payment.booking_id } }
      );
    }

    res.json(payment);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al actualizar el monto del pago' });
  }
});

// Crear pago manualmente (sin booking_id ni user_id)
router.post('/manual', [auth, isAdmin], async (req, res) => {
  try {
    const { booking_id, user_id, amount, status, customer_name, customer_email } = req.body;
    
    // Validate required fields
    if (!amount || !status) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Validate amount is a positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'El monto debe ser un número positivo' });
    }

    // Validate status is one of the allowed values
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    const normalizedStatus = status.toUpperCase();
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const payment = await Payment.create({
      booking_id: booking_id || null,
      user_id: user_id || null,
      amount: parsedAmount,
      status: normalizedStatus,
      customer_name: customer_name || null,
      customer_email: customer_email || null,
      payment_date: normalizedStatus === 'COMPLETED' ? new Date() : null
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creando pago manual:', error);
    res.status(500).json({ 
      message: 'Error creando pago manual',
      error: error.message 
    });
  }
});

// Eliminar pago
router.delete('/transactions/:id', [auth, isAdmin], async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
    await payment.destroy();
    res.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando pago:', error);
    res.status(500).json({ message: 'Error eliminando pago' });
  }
});

module.exports = router;