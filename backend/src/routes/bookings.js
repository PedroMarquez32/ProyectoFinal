const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Booking, Trip } = require('../models');
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

    res.json({ status: booking.status });
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
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      room_type: req.body.room_type,
      number_of_participants: req.body.number_of_participants,
      total_price: req.body.total_price,
      status: 'PENDING',
      special_requests: req.body.special_requests || ''
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Error al crear la reserva',
      error: error.message 
    });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Trip,
        attributes: ['title', 'destination', 'image', 'description', 'price']
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
          attributes: ['title', 'destination', 'start_date', 'end_date']
        }
      ]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error del servidor' });
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

// Update booking (admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Actualizar la reserva
    await booking.update({
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      room_type: req.body.room_type,
      number_of_participants: req.body.number_of_participants,
      total_price: req.body.total_price,
      special_requests: req.body.special_requests
    });

    res.json(booking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error del servidor' });
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

    await booking.destroy();
    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al eliminar la reserva' });
  }
});

module.exports = router;