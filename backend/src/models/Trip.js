const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Trip extends Model {
    static associate(models) {
      // Define associations here
      Trip.hasMany(models.Booking, {
        foreignKey: 'trip_id',
        sourceKey: 'id'
      });
      Trip.hasMany(models.Favorite, {
        foreignKey: 'trip_id',
        sourceKey: 'id'
      });
      Trip.hasMany(models.TripImage, {
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
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    max_participants: {
      type: DataTypes.INTEGER,
      defaultValue: 20
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    highlights: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    itinerary: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Trip',
    tableName: 'trips',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Trip;
};