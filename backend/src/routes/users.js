const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { User } = require('../models');
const { auth, isAdmin } = require('../middleware/auth'); // Importar isAdmin desde auth

// Asegurar que el directorio existe
const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ruta para subir avatar
router.post('/upload-avatar', auth, (req, res) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Error en la subida: ' + err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    // Actualizar usuario con la nueva imagen
    User.findByPk(req.user.id)
      .then(user => {
        const imageUrl = `/uploads/avatars/${req.file.filename}`;
        return user.update({ avatar: imageUrl });
      })
      .then(updatedUser => {
        res.json({
          message: 'Avatar actualizado correctamente',
          imageUrl: updatedUser.avatar
        });
      })
      .catch(error => {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Error al actualizar el avatar' });
      });
  });
});

// Update user profile (including avatar)
router.put('/update', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { email, username, avatar } = req.body;
    await user.update({ 
      email, 
      username,
      avatar // Solo guardaremos la URL de la imagen
    });

    res.json({ 
      message: 'Perfil actualizado correctamente',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
});

router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'created_at']
    });
    res.json(users);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/count', [auth, isAdmin], async (req, res) => {
  try {
    const count = await User.count();
    res.json({ count });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/role', [auth, isAdmin], async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ role });
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ username, email });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;