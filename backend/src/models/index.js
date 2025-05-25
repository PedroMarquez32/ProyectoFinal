const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Trip = require('./Trip');
const Booking = require('./Booking');
const User = require('./User');

const db = {};

// Inicializamos Sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Importamos los modelos
db.User = require('./User')(sequelize);
db.Trip = require('./Trip')(sequelize);
db.Booking = require('./Booking')(sequelize);
db.Favorite = require('./Favorite')(sequelize);
db.Feature = require('./Feature')(sequelize);
db.TripImage = require('./TripImage')(sequelize);
db.Review = require('./Review')(sequelize, Sequelize);

// Definimos las relaciones
db.User.hasMany(db.Booking, {
  foreignKey: 'user_id',
  sourceKey: 'id',
  onDelete: 'CASCADE'
});

db.Booking.belongsTo(db.User, {
  foreignKey: 'user_id',
  targetKey: 'id'
});

db.Trip.hasMany(db.Booking, {
  foreignKey: 'trip_id',
  sourceKey: 'id',
  onDelete: 'CASCADE'
});

db.Booking.belongsTo(db.Trip, {
  foreignKey: 'trip_id',
  targetKey: 'id'
});

db.User.hasMany(db.Favorite, {
  foreignKey: 'user_id',
  sourceKey: 'id',
  onDelete: 'CASCADE'
});

db.Trip.hasMany(db.Favorite, {
  foreignKey: 'trip_id',
  sourceKey: 'id',
  onDelete: 'CASCADE'
});

db.Favorite.belongsTo(db.User, {
  foreignKey: 'user_id',
  targetKey: 'id'
});

db.Favorite.belongsTo(db.Trip, {
  foreignKey: 'trip_id',
  targetKey: 'id'
});

// Definir las asociaciones
db.Review.belongsTo(db.User, {
  foreignKey: 'user_id'
});

db.Review.belongsTo(db.Trip, {
  foreignKey: 'trip_id'
});

// Define las relaciones entre modelos aquí si las hay
// Por ejemplo:
// Trip.hasMany(Booking);
// Booking.belongsTo(Trip);

module.exports = db;