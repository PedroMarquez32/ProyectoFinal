const { Model, DataTypes } = require('sequelize');

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
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    image: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    rating: DataTypes.DECIMAL(2, 1),
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    max_participants: DataTypes.INTEGER,
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