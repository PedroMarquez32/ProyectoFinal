import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myTrips');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [customTrips, setCustomTrips] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    username: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      await fetchUserData();
      await fetchUserBookings();
      await fetchUserFavorites();
      await fetchCustomTrips();
    };

    loadUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditForm({
          email: data.user.email,
          username: data.user.username,
          avatar: data.user.avatar || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener las reservas');
      }
      
      const data = await response.json();
      console.log('Bookings data:', data); // Para debugging
      
      const validBookings = data.filter(booking => 
        booking && 
        booking.Trip && // Nota la T mayúscula por Sequelize
        booking.Trip.id && 
        booking.Trip.title && 
        booking.Trip.destination
      ).map(booking => ({
        ...booking,
        trip: booking.Trip // Normalizar la estructura
      }));
      
      setBookings(validBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/favorites', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener los favoritos');
      }
      
      const data = await response.json();
      console.log('Favorites data:', data); // Para debugging
      
      const validFavorites = data.filter(favorite => 
        favorite && 
        favorite.Trip && // Nota la T mayúscula por Sequelize
        favorite.Trip.id && 
        favorite.Trip.title
      ).map(favorite => ({
        ...favorite,
        trip: favorite.Trip // Normalizar la estructura
      }));
      
      setFavorites(validFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
  };

  const fetchCustomTrips = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/custom-trips/my-requests', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCustomTrips(data);
      }
    } catch (error) {
      console.error('Error fetching custom trips:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!editForm.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!editForm.username) {
      errors.username = 'El username es requerido';
    } else if (editForm.username.length < 3) {
      errors.username = 'El username debe tener al menos 3 caracteres';
    }
    
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateError(null);
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setUpdateError('Por favor corrige los errores en el formulario');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: editForm.email,
          username: editForm.username
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsEditing(false);
        fetchUserData();
        alert('Perfil actualizado correctamente');
      } else {
        setUpdateError(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFavorite = async (tripId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/toggle/${tripId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Actualizar la lista de favoritos
        fetchUserFavorites();
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'myTrips':
        return (
          <div className="grid grid-cols-1 gap-6">
            {bookings.length > 0 ? bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="relative h-48 md:h-full">
                    <img 
                      src={booking.trip.image || '/placeholder-image.jpg'} 
                      alt={booking.trip.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="absolute top-0 right-0 m-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 p-6">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">
                          {booking.trip.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{booking.trip.destination}</p>
                        <div className="space-y-2 text-gray-600">
                          <p className="flex items-center gap-2">
                            <span className="text-[#4DA8DA]">📅</span>
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-[#4DA8DA]">👥</span>
                            {booking.number_of_participants} {booking.number_of_participants === 1 ? 'persona' : 'personas'}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-[#4DA8DA]">💰</span>
                            {booking.total_price}€
                          </p>
                          {booking.room_type && (
                            <p className="flex items-center gap-2">
                              <span className="text-[#4DA8DA]">🏨</span>
                              {booking.room_type}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link 
                          to={`/destination/${booking.trip.id}`}
                          className="inline-flex items-center text-[#4DA8DA] hover:text-[#3a8bb9] font-medium"
                        >
                          Ver Detalles del Viaje
                          <span className="material-icons ml-1 text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">No tienes ninguna reserva todavía</p>
                <Link 
                  to="/destinations"
                  className="mt-4 inline-block text-[#4DA8DA] hover:text-[#3a8bb9] font-medium"
                >
                  Explorar Destinos
                </Link>
              </div>
            )}
          </div>
        );
      case 'favorites':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.length > 0 ? favorites.map(favorite => (
              <div key={favorite.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={favorite.trip?.image || '/placeholder-image.jpg'}
                    alt={favorite.trip?.title || 'Destino'}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <button 
                    onClick={() => handleRemoveFavorite(favorite.trip.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50"
                  >
                    ❤️
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    {favorite.trip?.title || 'Título no disponible'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {favorite.trip?.description || 'Descripción no disponible'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4DA8DA] font-bold">
                      {favorite.trip?.price ? `${favorite.trip.price}€` : 'Precio no disponible'}
                    </span>
                    <Link
                      to={`/destination/${favorite.trip?.id}`}
                      className="text-[#4DA8DA] hover:text-[#3a8bb9] font-medium"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">No tienes destinos favoritos</p>
                <Link 
                  to="/destinations"
                  className="mt-4 inline-block text-[#4DA8DA] hover:text-[#3a8bb9] font-medium"
                >
                  Explorar Destinos
                </Link>
              </div>
            )}
          </div>
        );

      case 'customTrips':
        return (
          <div className="grid grid-cols-1 gap-6">
            {customTrips.length > 0 ? customTrips.map(trip => (
              <div key={trip.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{trip.destination}</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="text-[#4DA8DA]">📅</span>
                        {new Date(trip.departure_date).toLocaleDateString()} - {new Date(trip.return_date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-[#4DA8DA]">👥</span>
                        {trip.number_of_participants} personas
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-[#4DA8DA]">💰</span>
                        {trip.budget_per_person}€ por persona
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-[#4DA8DA]">🏨</span>
                        {trip.accommodation_type}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-[#4DA8DA]">🎯</span>
                        {trip.interests.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trip.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      trip.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">No tienes viajes personalizados</p>
                <button 
                  onClick={() => navigate('/custom-trip')}
                  className="mt-4 text-[#4DA8DA] hover:text-[#3a8bb9] font-medium"
                >
                  Crear Viaje Personalizado
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6e7d7]">
      <Navbar />
      
      <div className="bg-gradient-to-r from-[#40E0D0] to-[#2980B9] py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.parentElement.innerHTML = user.username[0].toUpperCase();
                    }}
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {user.username[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user?.username}</h1>
                <div className="flex gap-4 text-white/80">
                  <span>Miembro desde {new Date(user?.created_at).getFullYear()}</span>
                  <span>•</span>
                  <span>{bookings.length} viajes reservados</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div className="mt-8">
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Editar Perfil</h3>
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4DA8DA] focus:border-transparent transition-all text-gray-900"
                        placeholder="Tu nombre de usuario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4DA8DA] focus:border-transparent transition-all text-gray-900"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  {updateError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {updateError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b">
            <nav className="flex">
              <button
                className={`px-6 py-4 font-medium ${
                  activeTab === 'myTrips' 
                    ? 'text-[#4DA8DA] border-b-2 border-[#4DA8DA]' 
                    : 'text-gray-500 hover:text-[#4DA8DA]'
                }`}
                onClick={() => setActiveTab('myTrips')}
              >
                Mis Viajes ({bookings.length})
              </button>
              <button
                className={`px-6 py-4 font-medium ${
                  activeTab === 'favorites' 
                    ? 'text-[#4DA8DA] border-b-2 border-[#4DA8DA]' 
                    : 'text-gray-500 hover:text-[#4DA8DA]'
                }`}
                onClick={() => setActiveTab('favorites')}
              >
                Favoritos ({favorites.length})
              </button>
              <button
                className={`px-6 py-4 font-medium ${
                  activeTab === 'customTrips' 
                    ? 'text-[#4DA8DA] border-b-2 border-[#4DA8DA]' 
                    : 'text-gray-500 hover:text-[#4DA8DA]'
                }`}
                onClick={() => setActiveTab('customTrips')}
              >
                Viajes Personalizados ({customTrips.length})
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;