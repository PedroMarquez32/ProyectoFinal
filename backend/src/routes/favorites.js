const express = require('express');
const router = express.Router();
const { Favorite, Trip } = require('../models');
const { auth } = require('../middleware/auth');

// Obtener todos los favoritos del usuario
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Trip,
        attributes: ['id', 'title', 'destination', 'description', 'price', 'image']
      }],
      order: [['created_at', 'DESC']]
    });

    console.log('Found favorites:', favorites.length);
    res.json(favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Error al obtener favoritos' });
  }
});

// Toggle favorito
router.post('/toggle/:tripId', auth, async (req, res) => {
  try {
    const existing = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        trip_id: req.params.tripId
      }
    });

    if (existing) {
      await existing.destroy();
      res.json({ isFavorite: false });
    } else {
      await Favorite.create({
        user_id: req.user.id,
        trip_id: req.params.tripId
      });
      res.json({ isFavorite: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Error al actualizar favorito' });
  }
});

module.exports = router;