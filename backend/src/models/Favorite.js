const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Favorite extends Model {
    static associate(models) {
      Favorite.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
      Favorite.belongsTo(models.Trip, {
        foreignKey: 'trip_id',
        targetKey: 'id'
      });
    }
  }

  Favorite.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Favorite;
};