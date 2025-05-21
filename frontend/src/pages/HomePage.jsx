import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FavoriteButton from '../components/FavoriteButton';
import DestinationCard from '../components/DestinationCard';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/trips/featured', {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <section className="bg-[#4DA8DA] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Descubre tu próxima aventura</h1>
            <p className="text-xl">Explora destinos únicos y crea memorias inolvidables</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">Destinos Destacados</h2>
          
          {loading && (
            <div className="text-center">Cargando destinos...</div>
          )}
          
          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(destination => (
              <DestinationCard 
                key={destination.id} 
                destination={destination} 
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
