const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { Review } = require('../models');

// Crear una nueva review
router.post('/', auth, async (req, res) => {
  try {
    const { trip_id, rating, comment } = req.body;
    const user_id = req.user.id;

    const review = await Review.create({
      user_id,
      trip_id,
      rating,
      comment,
      is_approved: false
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Get reviews for a specific trip
router.get('/trip/:tripId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: {
        trip_id: req.params.tripId,
        is_approved: true
      },
      include: [
        {
          model: require('../models').User,
          attributes: ['username', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Error getting reviews' });
  }
});

// Get all reviews (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: require('../models').User,
          attributes: ['username', 'email']
        },
        {
          model: require('../models').Trip,
          attributes: ['title', 'destination']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Error getting reviews' });
  }
});

// Update review approval status
router.patch('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.update({
      is_approved: req.body.is_approved
    });

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Update review content
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.update({
      rating,
      comment,
      updated_at: new Date()
    });

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Delete review (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.destroy();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;