import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
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
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsMenuOpen(false); // Close menu on logout
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-xl md:text-2xl font-bold">
          TravelDream
        </Link>

        {/* Hamburger Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/destinations" className="text-white hover:text-[#4DA8DA] transition-colors">
            Destinos
          </Link>
          {isAuthenticated && (
            <Link to="/custom-trip" className="text-white hover:text-[#4DA8DA] transition-colors">
              Viaje Personalizado
            </Link>
          )}
          <Link to="/about" className="text-white hover:text-[#4DA8DA] transition-colors">
            Sobre Nosotros
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-white hover:text-[#4DA8DA] transition-colors">
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/profile" 
                className="text-white hover:text-[#4DA8DA] transition-colors"
              >
                Mi Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#3a8bb9] transition-colors"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#3a8bb9] transition-colors"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden absolute top-full left-0 right-0 bg-gray-800 z-50
          ${isMenuOpen ? 'block' : 'hidden'}
          transition-all duration-300 ease-in-out
        `}>
          <div className="flex flex-col p-4 space-y-4">
            <Link 
              to="/destinations" 
              className="text-white hover:text-[#4DA8DA] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Destinos
            </Link>
            {isAuthenticated && (
              <Link 
                to="/custom-trip" 
                className="text-white hover:text-[#4DA8DA] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Viaje Personalizado
              </Link>
            )}
            <Link 
              to="/about" 
              className="text-white hover:text-[#4DA8DA] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre Nosotros
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-white hover:text-[#4DA8DA] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Panel de Admin
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-white hover:text-[#4DA8DA] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#3a8bb9] transition-colors w-full text-left"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#3a8bb9] transition-colors w-full text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;