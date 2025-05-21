const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TripImage extends Model {
    static associate(models) {
      TripImage.belongsTo(models.Trip, {
        foreignKey: 'trip_id',
        targetKey: 'id'
      });
    }
  }

  TripImage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'TripImage',
    tableName: 'trip_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return TripImage;
};