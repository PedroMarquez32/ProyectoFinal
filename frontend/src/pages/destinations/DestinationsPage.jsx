import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import FavoriteButton from '../../components/common/FavoriteButton';
import PageTransition from '../../components/common/PageTransition';
import Spinner from '../../components/common/Spinner';

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`);
        if (!response.ok) throw new Error('Error fetching destinations');
        setDestinations(await response.json());
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const DestinationCard = ({ destination }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        {destination.tag && (
          <span className="absolute top-2 md:top-4 left-2 md:left-4 bg-red-500 text-white px-2 md:px-3 py-1 text-xs md:text-sm">
            {destination.tag}
          </span>
        )}
        <div className="absolute top-2 md:top-4 right-2 md:right-4">
          <FavoriteButton tripId={destination.id} />
        </div>
        <img 
          src={destination.image} 
          alt={destination.title} 
          className="w-full h-40 md:h-48 object-cover"
          onError={(e) => e.target.src = 'https://via.placeholder.com/400x300'}
        />
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2 text-[#3a3a3c]">
          <span className="text-xs md:text-sm">⏱ {destination.duration} days</span>
          <span className="text-xs md:text-sm">⭐ {destination.rating}/5</span>
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-2 text-[#3a3a3c]">{destination.title}</h3>
        <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">{destination.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-[#3a3a3c] font-bold text-sm md:text-base">From {destination.price}€</span>
          <Link 
            to={`/destination/${destination.id}`}
            className="bg-[#4DA8DA] text-white px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base hover:bg-[#3a8bb9] transition-colors"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="col-span-full text-center py-6 md:py-8">
      <Spinner />
      <p className="mt-2 text-gray-900">Cargando destinos...</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#40E0D0] to-[#2980B9]">
        <Navbar />
        
        <div className="text-center py-8 md:py-10 lg:py-12">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3a3a3c] mb-3 md:mb-4">Nuestros Destinos</h1>
          <p className="text-base md:text-lg text-[#3a3a3c] px-4">
            Explora nuestra selección cuidadosamente curada de las mejores experiencias de viaje del mundo.
          </p>
        </div>

        <div className="container mx-auto px-4 flex-grow pb-8 md:pb-10 lg:pb-12">
          <h2 className="text-xl md:text-2xl font-bold text-[#3a3a3c] mb-4 md:mb-6">Destinos Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : destinations.length === 0 ? (
              <div className="text-center py-4">No destinations found</div>
            ) : (
              destinations.map(destination => <DestinationCard key={destination.id} destination={destination} />)
            )}
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default DestinationsPage;