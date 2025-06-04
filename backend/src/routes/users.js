const express = require('express');
const router = express.Router();
const { User, Review, Booking, Favorite, CustomTrip, Payment } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');
const { sequelize } = require('../config/database');

// Update user profile
router.put('/update', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { email, username } = req.body;
    await user.update({ 
      email, 
      username
    });

    res.json({ 
      message: 'Perfil actualizado correctamente',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
});

// Get all users (admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'created_at']
    });
    res.json(users);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error getting users' });
  }
});

// Update user role (admin only)
router.put('/:id/role', [auth, isAdmin], async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await user.update({ role });
    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating role' });
  }
});

// Update user by admin
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { username, email } = req.body;
    await user.update({ username, email });

    res.json({ 
      message: 'Usuario actualizado correctamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (admin only)
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario.' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Elimina reviews
    await Review.destroy({ where: { user_id: user.id } });
    // Elimina favoritos
    await Favorite.destroy({ where: { user_id: user.id } });
    // Elimina custom trips
    await CustomTrip.destroy({ where: { user_id: user.id } });

    // Elimina bookings y sus pagos
    const bookings = await Booking.findAll({ where: { user_id: user.id } });
    for (const booking of bookings) {
      await Payment.destroy({ where: { booking_id: booking.id } });
      await booking.destroy();
    }

    // Elimina pagos sueltos (no asociados a booking)
    await Payment.destroy({ where: { user_id: user.id } });

    // Finalmente elimina el usuario
    await user.destroy();

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

module.exports = router;