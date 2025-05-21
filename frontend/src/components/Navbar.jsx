import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin role

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setIsAdmin(data.user.role === 'ADMIN'); // Check if user is admin
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // Agregar event listener para cambios de autenticación
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-white text-2xl font-bold">TravelDream</Link>
          <Link to="/destinations" className="text-white hover:text-[#4DA8DA]">Destinations</Link>
          {isAuthenticated && (
            <Link to="/custom-trip" className="text-white hover:text-[#4DA8DA]">Custom Trip</Link>
          )}
          <Link to="/about" className="text-white hover:text-[#4DA8DA]">About Us</Link>
          {isAdmin && ( // Show admin dashboard link only for admins
            <Link to="/admin" className="text-white hover:text-[#4DA8DA]">Admin Dashboard</Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-white hover:text-[#4DA8DA]">
                Mi Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#3a8bb9]"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#3a8bb9]"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;