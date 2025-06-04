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
db.Review = require('./Review')(sequelize, Sequelize);
db.Payment = require('./Payment')(sequelize);
db.CustomTrip = require('./CustomTrip')(sequelize);

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

db.Trip.hasMany(db.Review, {
  foreignKey: 'trip_id',
  sourceKey: 'id',
  onDelete: 'CASCADE'
});
db.Review.belongsTo(db.Trip, {
  foreignKey: 'trip_id',
  onDelete: 'CASCADE'
});

// Definir las asociaciones para Payment
db.Payment.belongsTo(db.User, {
  foreignKey: 'user_id',
  targetKey: 'id'
});

db.User.hasMany(db.Payment, {
  foreignKey: 'user_id',
  sourceKey: 'id'
});

// Relación Payment <-> Booking
db.Payment.belongsTo(db.Booking, {
  foreignKey: 'booking_id',
  targetKey: 'id'
});
db.Booking.hasMany(db.Payment, {
  foreignKey: 'booking_id',
  sourceKey: 'id'
});

module.exports = db;