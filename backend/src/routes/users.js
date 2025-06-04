const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');
const { Review, Payment, Booking, CustomTrip } = require('../models');
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
  const t = await sequelize.transaction();
  
  try {
    if (parseInt(req.params.id) === req.user.id) {
      await t.rollback();
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar en orden y con manejo de errores individual
    try {
      // Reviews
      await Review.destroy({
        where: { user_id: user.id },
        transaction: t
      });
    } catch (error) {
      console.error('Error eliminando reviews:', error);
    }

    try {
      // Payments
      await Payment.destroy({
        where: { user_id: user.id },
        transaction: t
      });
    } catch (error) {
      console.error('Error eliminando pagos:', error);
    }

    try {
      // Bookings
      await Booking.destroy({
        where: { user_id: user.id },
        transaction: t
      });
    } catch (error) {
      console.error('Error eliminando reservas:', error);
    }

    try {
      // Custom Trips
      await CustomTrip.destroy({
        where: { user_id: user.id },
        transaction: t
      });
    } catch (error) {
      console.error('Error eliminando viajes personalizados:', error);
    }

    // Finalmente eliminar el usuario
    await user.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      message: 'Error al eliminar usuario',
      error: error.message 
    });
  }
});

module.exports = router;