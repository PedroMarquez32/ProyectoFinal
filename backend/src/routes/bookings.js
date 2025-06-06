const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Booking, Payment, Trip, User } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');

// Get booking status
router.get('/status/:tripId', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        user_id: req.user.id,
        trip_id: req.params.tripId
      },
      order: [['created_at', 'DESC']]
    });

    if (!booking) {
      return res.json({ status: null });
    }

    res.json({ 
      status: booking.status,
      id: booking.id  // Añadimos el ID de la reserva
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.body.trip_id);
    if (!trip) {
      return res.status(404).json({ message: 'Viaje no encontrado' });
    }

    const booking = await Booking.create({
      user_id: req.user.id,
      trip_id: req.body.trip_id,
      departure_date: req.body.departure_date,
      return_date: req.body.return_date,
      room_type: req.body.room_type,
      number_of_participants: req.body.number_of_participants,
      total_price: req.body.total_price,
      status: 'PENDING',
      special_requests: req.body.special_requests || ''
    });

    // Crear el pago asociado incluyendo el user_id
    const payment = await Payment.create({
      booking_id: booking.id,
      user_id: req.user.id, // Asegurarse de incluir el user_id
      amount: req.body.total_price,
      status: 'PENDING'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error al crear la reserva' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Trip,
        attributes: ['id', 'title', 'destination', 'description', 'price', 'image']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
});

// Get all bookings (admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Trip,
          attributes: ['id', 'title', 'destination', 'price', 'image']
        },
        {
          model: User,
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Asegurarse de que los datos del usuario están incluidos
    const formattedBookings = bookings.map(booking => {
      const plainBooking = booking.get({ plain: true });
      return {
        ...plainBooking,
        username: plainBooking.User?.username || 'Usuario no disponible',
        userEmail: plainBooking.User?.email || 'Email no disponible',
        departure_date: plainBooking.departure_date,
        return_date: plainBooking.return_date,
        Trip: plainBooking.Trip || {},
        User: plainBooking.User || {}
      };
    });

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Error del servidor',
      error: error.message 
    });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', [auth, isAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Update the PUT endpoint to handle booking updates
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    const {
      departure_date,
      return_date,
      room_type,
      number_of_participants,
      special_requests
    } = req.body;

    // Update booking with new dates without validation
    await booking.update({
      departure_date,
      return_date,
      room_type,
      number_of_participants,
      special_requests
    });

    // Update associated payment dates if they exist
    const payment = await Payment.findOne({
      where: { booking_id: booking.id }
    });

    if (payment) {
      await payment.update({
        payment_date: departure_date // Update payment date to match new departure
      });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error al actualizar la reserva' });
  }
});

// Add stats route
router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    const activeCount = await Booking.count({
      where: { 
        status: 'PENDING'
      }
    });

    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);

    const monthlyBookings = await Booking.findAll({
      where: {
        created_at: {
          [Op.gte]: monthStart
        }
      },
      include: [{
        model: Trip,
        attributes: ['title']
      }]
    });

    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => {
      return sum + parseFloat(booking.total_price || 0);
    }, 0);

    const recentActivity = await Booking.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{
        model: Trip,
        attributes: ['title']
      }],
      attributes: ['id', 'created_at', 'status', 'total_price']
    });

    res.json({
      activeCount,
      monthlyRevenue,
      recentActivity: recentActivity.map(booking => ({
        id: booking.id,
        type: 'booking',
        title: `New booking for ${booking.Trip.title}`,
        description: `Status: ${booking.status}`,
        time: booking.created_at
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete booking (admin only)
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Eliminar los pagos asociados
    await Payment.destroy({
      where: { booking_id: booking.id }
    });

    // Eliminar la reserva
    await booking.destroy();

    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al eliminar la reserva' });
  }
});

module.exports = router;