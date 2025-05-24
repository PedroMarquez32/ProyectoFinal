const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { auth, isAdmin } = require('../middleware/auth');

// Crear un nuevo viaje personalizado
router.post('/', auth, async (req, res) => {
  try {
    const {
      destination,
      departure_date,
      return_date,
      number_of_participants,
      budget_per_person,
      interests,
      accommodation_type
    } = req.body;

    const query = `
      INSERT INTO custom_trips (
        user_id,
        destination,
        departure_date,
        return_date,
        number_of_participants,
        budget_per_person,
        interests,
        accommodation_type,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      req.user.id,
      destination,
      departure_date,
      return_date,
      number_of_participants,
      budget_per_person,
      interests,
      accommodation_type,
      'PENDING'
    ];

    const [result] = await sequelize.query(query, {
      bind: values,
      type: sequelize.QueryTypes.INSERT
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating custom trip:', error);
    res.status(500).json({ message: 'Error al crear el viaje personalizado' });
  }
});

// Obtener los viajes personalizados del usuario
router.get('/my-requests', auth, async (req, res) => {
  try {
    const query = `
      SELECT * FROM custom_trips
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const results = await sequelize.query(query, {
      bind: [req.user.id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching custom trips:', error);
    res.status(500).json({ message: 'Error al obtener los viajes personalizados' });
  }
});

// Obtener todos los viajes personalizados (solo admin)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const query = `
      SELECT 
        ct.*,
        u.username,
        u.email,
        u.id as user_id
      FROM custom_trips ct
      LEFT JOIN users u ON ct.user_id = u.id
      ORDER BY ct.created_at DESC
    `;

    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    const formattedResults = results.map(trip => ({
      ...trip,
      User: {
        id: trip.user_id,
        username: trip.username,
        email: trip.email
      },
      departure_date: trip.departure_date,
      return_date: trip.return_date
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al obtener los viajes personalizados' });
  }
});

// Actualizar el estado de un viaje personalizado (solo admin)
router.patch('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const query = `
      UPDATE custom_trips
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const [result] = await sequelize.query(query, {
      bind: [status, id],
      type: sequelize.QueryTypes.UPDATE
    });

    if (!result) {
      return res.status(404).json({ message: 'Viaje personalizado no encontrado' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating custom trip:', error);
    res.status(500).json({ message: 'Error al actualizar el viaje personalizado' });
  }
});

// Update custom trip (admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const query = `
      UPDATE custom_trips 
      SET 
        destination = $1,
        departure_date = $2,
        return_date = $3,
        number_of_participants = $4,
        budget_per_person = $5,
        accommodation_type = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      req.body.destination,
      req.body.departure_date,
      req.body.return_date,
      req.body.number_of_participants,
      req.body.budget_per_person,
      req.body.accommodation_type,
      req.params.id
    ];

    const [result] = await sequelize.query(query, {
      bind: values,
      type: sequelize.QueryTypes.UPDATE
    });

    if (!result) {
      return res.status(404).json({ message: 'Custom trip not found' });
    }

    // Obtener el viaje actualizado con la información del usuario
    const updatedTrip = await sequelize.query(`
      SELECT 
        ct.*,
        u.username,
        u.email,
        u.id as user_id
      FROM custom_trips ct
      LEFT JOIN users u ON ct.user_id = u.id
      WHERE ct.id = $1
    `, {
      bind: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });

    const formattedTrip = {
      ...updatedTrip[0],
      User: {
        id: updatedTrip[0].user_id,
        username: updatedTrip[0].username,
        email: updatedTrip[0].email
      }
    };

    res.json(formattedTrip);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating custom trip' });
  }
});

module.exports = router;