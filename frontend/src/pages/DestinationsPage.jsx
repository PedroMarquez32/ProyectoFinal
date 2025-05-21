import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FavoriteButton from '../components/FavoriteButton';

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    region: '',
    price: '',
    duration: '',
    rating: ''
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      console.log('Fetching destinations...'); // Debug log
      
      const response = await fetch('http://localhost:5000/api/trips');
      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        throw new Error('Error fetching destinations');
      }
      
      const data = await response.json();
      console.log('Destinations received:', data); // Debug log
      setDestinations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#40E0D0] to-[#2980B9] pb-8">
      <Navbar />
      
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-[#3a3a3c] mb-4">Our Destinations</h1>
        <p className="text-[#3a3a3c] text-lg">
          Explore our carefully curated selection of the world's most amazing travel experiences.
        </p>
      </div>

      {/* Featured Destinations */}
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#3a3a3c] mb-6">Featured Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-900">Loading destinations...</p>
            </div>
          ) : error ? (
            <div className="col-span-3 text-center py-8 text-red-600">
              {error}
            </div>
          ) : destinations.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-900">
              No destinations found
            </div>
          ) : (
            destinations.map((destination) => (
              <div key={destination.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  {destination.tag && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm">
                      {destination.tag}
                    </span>
                  )}
                  <div className="absolute top-4 right-4">
                    <FavoriteButton tripId={destination.id} />
                  </div>
                  <img 
                    src={destination.image} 
                    alt={destination.title} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-[#3a3a3c]">
                    <span className="text-sm">⏱ {destination.duration} days</span>
                    <span className="text-sm">⭐ {destination.rating}/5</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3a3a3c]">{destination.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{destination.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#3a3a3c] font-bold">From {destination.price}€</span>
                    <Link 
                      to={`/destination/${destination.id}`}
                      className="bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#3a8bb9] transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DestinationsPage;