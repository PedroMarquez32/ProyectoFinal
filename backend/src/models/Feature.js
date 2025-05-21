const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Feature extends Model {
    static associate(models) {
      // Define aquí las asociaciones si las hay
    }
  }

  Feature.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Feature',
    tableName: 'features',
    timestamps: false
  });

  return Feature;
};