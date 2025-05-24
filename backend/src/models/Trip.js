const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize) => {
  class Trip extends Model {
    static associate(models) {
      Trip.hasMany(models.Booking, {
        foreignKey: 'trip_id',
        sourceKey: 'id'
      });
      Trip.hasMany(models.Favorite, {
        foreignKey: 'trip_id',
        sourceKey: 'id'
      });
    }
  }

  Trip.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1)
    },
    image: {
      type: DataTypes.STRING
    },
    max_participants: {
      type: DataTypes.INTEGER
    },
    overview: {
      type: DataTypes.TEXT
    },
    highlights: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    itinerary: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Trip',
    tableName: 'trips',
    underscored: true,
    timestamps: true
  });

  return Trip;
};