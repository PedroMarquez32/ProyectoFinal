const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log('Token recibido:', token);

    if (!token) {
      console.log('No se encontró token');
      return res.status(401).json({ message: 'No autorizado - No token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decodificado:', decoded);

      const user = await User.findByPk(decoded.userId);
      console.log('Usuario encontrado:', user ? 'Sí' : 'No');

      if (!user) {
        console.log('Usuario no encontrado');
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Error al verificar token:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Error en middleware:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  next();
};

module.exports = { auth, isAdmin };