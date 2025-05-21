const { Trip } = require('../models');

async function seedTrips() {
  try {
    await Trip.bulkCreate([
      {
        title: 'Aventura en París',
        destination: 'París, Francia',
        description: 'Descubre la ciudad del amor...',
        price: 1299.99,
        image: 'https://example.com/paris.jpg',
        duration: 7,
        is_active: true
      },
      // Añade más destinos aquí
    ]);
    console.log('Trips seeded successfully');
  } catch (error) {
    console.error('Error seeding trips:', error);
  }
}

module.exports = seedTrips; 