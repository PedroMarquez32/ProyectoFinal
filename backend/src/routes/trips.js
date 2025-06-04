const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { Trip, Booking, Feature, TripImage } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']]
    });
    res.json(trips);
  } catch (error) {
    console.error('Error getting trips:', error);
    res.status(500).json({ message: 'Error al obtener los destinos' });
  }
});

// Get featured trips
router.get('/featured', async (req, res) => {
  try {
    const trips = await Trip.findAll({
      where: { 
        is_active: true
      },
      limit: 6,
      order: [['created_at', 'DESC']]
    });
    
    if (!trips) {
      return res.status(404).json({ message: 'No se encontraron destinos' });
    }
    
    res.json(trips);
  } catch (error) {
    console.error('Error getting featured trips:', error);
    res.status(500).json({ message: 'Error al obtener los destinos destacados' });
  }
});

// Get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      attributes: [
        'id', 'title', 'destination', 'description', 'price', 
        'duration', 'rating', 'image', 'max_participants',
        'overview', 'highlights', 'itinerary'
      ],
      raw: true 
    });
    
    if (!trip) {
      return res.status(404).json({ message: 'Destino no encontrado' });
    }

    // Asegurarse de que los campos JSON se parsean correctamente
    const formattedTrip = {
      ...trip,
      highlights: Array.isArray(trip.highlights) ? trip.highlights : [],
      itinerary: typeof trip.itinerary === 'string' ? 
        JSON.parse(trip.itinerary) : 
        (Array.isArray(trip.itinerary) ? trip.itinerary : [])
    };
    
    res.json(formattedTrip);
  } catch (error) {
    console.error('Error getting trip:', error);
    res.status(500).json({ 
      message: 'Error al obtener el destino',
      error: error.message 
    });
  }
});

// Create trip (admin only)
router.post('/', [auth, isAdmin], async (req, res) => {
  try {
    const trip = await Trip.create({
      title: req.body.title,
      destination: req.body.destination,
      description: req.body.description,
      price: parseFloat(req.body.price),
      duration: parseInt(req.body.duration),
      rating: parseFloat(req.body.rating) || 0,
      image: req.body.image || null,
      start_date: req.body.start_date || new Date(),
      end_date: req.body.end_date || new Date(),
      max_participants: parseInt(req.body.max_participants) || 20,
      original_price: parseFloat(req.body.price),
      overview: req.body.overview || '',
      highlights: req.body.highlights || [],
      itinerary: req.body.itinerary || [],
      is_active: true,
      current_participants: 0
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ 
      message: 'Error creating trip',
      error: error.message 
    });
  }
});

// Update trip (admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await trip.update({
      ...req.body,
      price: parseFloat(req.body.price),
      duration: parseInt(req.body.duration),
      rating: parseFloat(req.body.rating),
      max_participants: parseInt(req.body.max_participants),
      highlights: Array.isArray(req.body.highlights) ? req.body.highlights : [],
      itinerary: Array.isArray(req.body.itinerary) ? req.body.itinerary : []
    });

    res.json(trip);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete trip (admin only)
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await trip.destroy();
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add popular trips route
router.get('/stats/popular', [auth, isAdmin], async (req, res) => {
  try {
    const popularTrips = await Trip.findAll({
      attributes: [
        'id',
        'destination',
        'rating',
        [sequelize.fn('COUNT', sequelize.col('bookings.id')), 'bookingCount'],
        [sequelize.fn('SUM', sequelize.col('bookings.total_price')), 'totalRevenue']
      ],
      include: [{
        model: Booking,
        attributes: [],
        required: false
      }],
      group: ['trips.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('bookings.id')), 'DESC']],
      limit: 5
    });

    res.json(popularTrips.map(trip => ({
      id: trip.id,
      destination: trip.destination,
      bookings: parseInt(trip.getDataValue('bookingCount')) || 0,
      revenue: parseFloat(trip.getDataValue('totalRevenue')) || 0,
      rating: trip.rating
    })));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;