require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');
const models = require('./models');
const tripsRoutes = require('./routes/trips');
const customTripsRoutes = require('./routes/customTrips');
const path = require('path');
const fs = require('fs');
const financesRoutes = require('./routes/finances');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://proyectofinalfrontend-production-65e3.up.railway.app' || "https://traveldreams.com",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', tripsRoutes);
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/custom-trips', customTripsRoutes);
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/users', require('./routes/users'));
const reviewsRouter = require('./routes/reviews');
app.use('/api/reviews', reviewsRouter);
app.use('/api/finances', financesRoutes);

// Sirve los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Para rutas que no sean API, devuelve el index.html del frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use(errorHandler);

// Sync database
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('Database synced');
    const PORT = process.env.PORT || 5000 || "https://proyectofinal-production-b22c.up.railway.app"
    // ;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });