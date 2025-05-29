import { useState, useEffect } from 'react';

export const useDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDestinations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error fetching destinations');
      
      const data = await response.json();
      setDestinations(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const updateDestination = async (id, data) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error updating destination');
      await fetchDestinations();
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const deleteDestination = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error deleting destination');
      await fetchDestinations();
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  return {
    destinations,
    loading,
    error,
    updateDestination,
    deleteDestination,
    refreshDestinations: fetchDestinations
  };
};
