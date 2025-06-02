import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoriteButton from '../components/common/FavoriteButton';
import DestinationCard from '../components/destinations/DestinationCard';
import PageTransition from '../components/common/PageTransition';
import Spinner from '../components/common/Spinner';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/featured`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los destinos');
        }
        
        const data = await response.json();
        setDestinations(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/destinations?search=${searchQuery}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          <section className="bg-[#4DA8DA] text-white py-12 md:py-16 lg:py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Descubre tu próxima aventura</h1>
              <p className="text-base md:text-lg lg:text-xl">Explora destinos únicos y crea memorias inolvidables</p>
            </div>
          </section>

          <section className="container mx-auto px-4 py-8 md:py-10 lg:py-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Destinos Destacados</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {destinations.map(destination => (
                  <DestinationCard 
                    key={destination.id} 
                    destination={destination} 
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default HomePage;
