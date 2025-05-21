const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CustomTrip extends Model {
    static associate(models) {
      CustomTrip.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  }

  CustomTrip.init({
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
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departure_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    number_of_participants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    budget_per_person: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    accommodation_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'),
      defaultValue: 'PENDING'
    }
  }, {
    sequelize,
    modelName: 'CustomTrip',
    tableName: 'custom_trips',
    underscored: true,
    timestamps: true
  });

  return CustomTrip;
};

const express = require('express');
const router = express.Router();
const { CustomTrip, User } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');

// Update custom trip status (admin only)
router.patch('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    const customTrip = await CustomTrip.findByPk(req.params.id);
    
    if (!customTrip) {
      return res.status(404).json({ message: 'Custom trip not found' });
    }

    await customTrip.update({ status });
    res.json(customTrip);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating custom trip status' });
  }
});

// Update custom trip details (admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const customTrip = await CustomTrip.findByPk(req.params.id);
    
    if (!customTrip) {
      return res.status(404).json({ message: 'Custom trip not found' });
    }

    await customTrip.update({
      destination: req.body.destination,
      departure_date: req.body.departure_date,
      return_date: req.body.return_date,
      number_of_participants: req.body.number_of_participants,
      budget_per_person: req.body.budget_per_person,
      interests: req.body.interests,
      accommodation_type: req.body.accommodation_type
    });

    res.json(customTrip);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating custom trip' });
  }
});

