import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FavoriteButton = ({ tripId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkIfFavorite();
  }, [tripId]);

  const checkIfFavorite = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/favorites', {
        credentials: 'include',
      });
      if (response.ok) {
        const favorites = await response.json();
        setIsFavorite(favorites.some(fav => fav.trip_id === tripId));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Evitar que el click se propague
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/toggle/${tripId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (isLoading) {
    return <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full"></div>;
  }

  return (
    <button
      onClick={toggleFavorite}
      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
    >
      <svg 
        className={`w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-gray-400'} transition-colors`}
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;