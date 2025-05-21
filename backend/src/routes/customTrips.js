const express = require('express');
const router = express.Router();
const { CustomTrip, User } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');

// Get all custom trips (admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const customTrips = await CustomTrip.findAll({
      include: [{
        model: User,
        attributes: ['username', 'email']
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(customTrips);
  } catch (error) {
    console.error('Error getting custom trips:', error);
    res.status(500).json({ message: 'Error getting custom trips' });
  }
});

// Create new custom trip
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating custom trip:', req.body);
    
    const customTrip = await CustomTrip.create({
      user_id: req.user.id,
      destination: req.body.destination,
      departure_date: req.body.departure_date,
      return_date: req.body.return_date,
      number_of_participants: req.body.number_of_participants,
      budget_per_person: req.body.budget_per_person,
      interests: Array.isArray(req.body.interests) ? req.body.interests : [],
      accommodation_type: req.body.accommodation_type,
      status: 'PENDING'
    });

    res.status(201).json(customTrip);
  } catch (error) {
    console.error('Error creating custom trip:', error);
    res.status(500).json({ 
      message: 'Error creating custom trip',
      error: error.message 
    });
  }
});

// Get user's custom trips
router.get('/my-requests', auth, async (req, res) => {
  try {
    const customTrips = await CustomTrip.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(customTrips);
  } catch (error) {
    console.error('Error getting custom trips:', error);
    res.status(500).json({ message: 'Error getting custom trips' });
  }
});

module.exports = router;