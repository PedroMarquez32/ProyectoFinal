import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { FaSuitcase, FaHeart, FaMagic, FaUserEdit, FaCalendarAlt, FaUser, FaMoneyBillWave, FaBed, FaCamera } from 'react-icons/fa';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myTrips');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [customTrips, setCustomTrips] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

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
      setLoading(true);
      setUpdateError(null);
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditForm({
          username: data.user.username,
          email: data.user.email,
          avatar: data.user.avatar || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUpdateError('Error de conexión');
    } finally {
      setLoading(false);
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
      
      const validBookings = data.filter(booking => 
        booking && 
        booking.Trip && 
        booking.Trip.id && 
        booking.Trip.title && 
        booking.Trip.destination
      ).map(booking => ({
        ...booking,
        trip: booking.Trip,
        start_date: booking.departure_date,
        end_date: booking.return_date
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
      setSaving(true);
      setUpdateError(null);
      setSuccess("");
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
        setSuccess("¡Perfil actualizado correctamente!");
      } else {
        setUpdateError(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Error de conexión');
    } finally {
      setIsSubmitting(false);
      setSaving(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const renderBooking = (booking) => (
    <div key={booking.id} className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {booking.Trip?.title || 'Viaje no disponible'}
          </h3>
          <p className="text-gray-500">{booking.Trip?.destination}</p>
          <div className="mt-2 space-y-2 text-sm">
            <p>Fechas: {formatDate(booking.departure_date)} - {formatDate(booking.return_date)}</p>
            <p>Tipo de habitación: {booking.room_type}</p>
            <p>Huéspedes: {booking.number_of_participants} {booking.number_of_participants === 1 ? 'persona' : 'personas'}</p>
            <p>Estado: <span className={`px-2 py-1 rounded-full text-xs font-medium
              ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}>
              {booking.status}
            </span></p>
          </div>
        </div>
      </div>
    </div>
  );

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
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {customTrips.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12">
                No tienes viajes personalizados todavía.
              </div>
            ) : (
              customTrips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center">
                  {trip.image ? (
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="w-40 h-32 object-cover rounded-xl shadow"
                    />
                  ) : (
                    <div className="w-40 h-32 bg-gradient-to-br from-[#4DA8DA]/30 to-[#2980B9]/10 rounded-xl flex items-center justify-center text-5xl text-[#4DA8DA]">
                      <FaMagic />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-[#3a3a3c] mb-1">{trip.destination}</h3>
                    <div className="text-gray-500 mb-1">
                      <FaCalendarAlt className="inline mr-1" />
                      {formatDate(trip.departure_date)} - {formatDate(trip.return_date)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-700 text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <FaUser /> Viajeros: {trip.number_of_participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMoneyBillWave /> Presupuesto: {trip.budget_per_person?.toLocaleString('es-ES')}€
                      </span>
                      <span className="flex items-center gap-1">
                        <FaBed /> Alojamiento: {trip.accommodation_type}
                      </span>
                    </div>
                    {trip.preferences && trip.preferences.length > 0 && (
                      <div className="mb-1">
                        <span className="font-semibold text-[#4DA8DA]">Preferencias:</span>
                        <span className="ml-2 text-gray-700">
                          {Array.isArray(trip.preferences)
                            ? trip.preferences.join(', ')
                            : trip.preferences}
                        </span>
                      </div>
                    )}
                    {trip.email && (
                      <div className="text-gray-500 text-xs">
                        <span className="font-semibold">Email:</span> {trip.email}
                      </div>
                    )}
                    {trip.status && (
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          trip.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          trip.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {trip.status === 'PENDING' ? 'Pendiente' :
                           trip.status === 'CONFIRMED' ? 'Confirmado' :
                           trip.status === 'CANCELLED' ? 'Cancelado' : trip.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
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
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-[#f6e7d7] pb-12">
          {/* Header de perfil */}
          <div className="w-full bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] py-12 mb-8 relative">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="block text-white/90 font-semibold text-lg" htmlFor="edit-username">
                        Nombre de usuario
                      </label>
                      <input
                        id="edit-username"
                        className="text-2xl font-bold text-[#22223b] bg-white border-2 border-[#4DA8DA] rounded-lg px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-[#4DA8DA] transition w-full"
                        value={editForm.username}
                        onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                        placeholder="Nombre de usuario"
                      />
                      <label className="block text-white/90 font-semibold text-base mt-2" htmlFor="edit-email">
                        Correo electrónico
                      </label>
                      <input
                        id="edit-email"
                        className="text-base font-normal text-[#22223b] bg-white border-2 border-[#4DA8DA] rounded-lg px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-[#4DA8DA] transition w-full"
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Correo electrónico"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-extrabold text-white mb-1">{user?.username}</h1>
                      <div className="flex gap-4 text-white/80 font-medium">
                        <span>Miembro desde {new Date(user?.created_at).getFullYear()}</span>
                        <span>•</span>
                        <span>{bookings.length} viajes reservados</span>
                      </div>
                      <div className="text-white/80 font-medium">{user?.email}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-8 md:mt-0">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      className="bg-[#4DA8DA] text-white px-6 py-3 rounded-lg font-bold shadow transition flex items-center gap-2"
                      onClick={handleEditSubmit}
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-bold shadow transition flex items-center gap-2"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-bold shadow transition flex items-center gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaUserEdit className="text-xl" />
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mensaje de éxito o error - AHORA AQUÍ */}
          {success && (
            <div className="container mx-auto px-4 -mt-8 mb-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">{success}</div>
            </div>
          )}
          {updateError && (
            <div className="container mx-auto px-4 -mt-8 mb-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{updateError}</div>
            </div>
          )}

          {/* Tabs alineados a la izquierda */}
          <div className="container mx-auto px-4">
            <div className="flex justify-start mb-8 gap-6">
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow transition-all duration-200 text-lg ${
                  activeTab === 'myTrips'
                    ? 'bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white scale-105'
                    : 'bg-white text-[#4DA8DA] border-2 border-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                }`}
                onClick={() => setActiveTab('myTrips')}
              >
                <FaSuitcase /> Mis Viajes ({bookings.length})
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow transition-all duration-200 text-lg ${
                  activeTab === 'favorites'
                    ? 'bg-gradient-to-r from-pink-400 to-red-400 text-white scale-105'
                    : 'bg-white text-pink-500 border-2 border-pink-300 hover:bg-pink-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('favorites')}
              >
                <FaHeart /> Favoritos ({favorites.length})
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow transition-all duration-200 text-lg ${
                  activeTab === 'customTrips'
                    ? 'bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white scale-105'
                    : 'bg-white text-[#4DA8DA] border-2 border-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                }`}
                onClick={() => setActiveTab('customTrips')}
              >
                <FaMagic /> Viajes Personalizados ({customTrips.length})
              </button>
            </div>

            {/* Contenido de los tabs */}
            <div className="mt-6">
              {activeTab === 'myTrips' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {bookings.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      No tienes viajes reservados todavía.
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center">
                        <img
                          src={booking.trip.image}
                          alt={booking.trip.title}
                          className="w-40 h-32 object-cover rounded-xl shadow"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {booking.status === 'PENDING' ? 'Pendiente' :
                               booking.status === 'CONFIRMED' ? 'Confirmado' :
                               booking.status === 'CANCELLED' ? 'Cancelado' : booking.status}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-[#3a3a3c] mb-1">{booking.trip.title}</h3>
                          <div className="text-gray-500 mb-2">{booking.trip.destination}</div>
                          <div className="flex flex-wrap gap-4 text-gray-700 text-sm mb-2">
                            <span className="flex items-center gap-1"><FaCalendarAlt /> {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                            <span className="flex items-center gap-1"><FaUser /> {booking.number_of_participants} {booking.number_of_participants === 1 ? 'persona' : 'personas'}</span>
                            <span className="flex items-center gap-1"><FaMoneyBillWave /> {booking.total_price}€</span>
                            {booking.room_type && (
                              <span className="flex items-center gap-1"><FaBed /> {booking.room_type}</span>
                            )}
                          </div>
                          <a
                            href={`/destination/${booking.trip.id}`}
                            className="inline-flex items-center text-[#4DA8DA] hover:text-[#3a8bb9] font-medium mt-2"
                          >
                            Ver Detalles del Viaje <span className="ml-1">→</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {favorites.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      No tienes destinos favoritos todavía.
                    </div>
                  ) : (
                    favorites.map((fav) => (
                      <div key={fav.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center">
                        <img
                          src={fav.trip.image}
                          alt={fav.trip.title}
                          className="w-40 h-32 object-cover rounded-xl shadow"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#3a3a3c] mb-1">{fav.trip.title}</h3>
                          <div className="text-gray-500 mb-2">{fav.trip.destination}</div>
                          <a
                            href={`/destination/${fav.trip.id}`}
                            className="inline-flex items-center text-[#4DA8DA] hover:text-[#3a8bb9] font-medium mt-2"
                          >
                            Ver Detalles <span className="ml-1">→</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'customTrips' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {customTrips.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      No tienes viajes personalizados todavía.
                    </div>
                  ) : (
                    customTrips.map((trip) => (
                      <div key={trip.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center">
                        {trip.image ? (
                          <img
                            src={trip.image}
                            alt={trip.destination}
                            className="w-40 h-32 object-cover rounded-xl shadow"
                          />
                        ) : (
                          <div className="w-40 h-32 bg-gradient-to-br from-[#4DA8DA]/30 to-[#2980B9]/10 rounded-xl flex items-center justify-center text-5xl text-[#4DA8DA]">
                            <FaMagic />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-bold text-[#3a3a3c] mb-1">{trip.destination}</h3>
                          <div className="text-gray-500 mb-1">
                            <FaCalendarAlt className="inline mr-1" />
                            {formatDate(trip.departure_date)} - {formatDate(trip.return_date)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-gray-700 text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <FaUser /> Viajeros: {trip.number_of_participants}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaMoneyBillWave /> Presupuesto: {trip.budget_per_person?.toLocaleString('es-ES')}€
                            </span>
                            <span className="flex items-center gap-1">
                              <FaBed /> Alojamiento: {trip.accommodation_type}
                            </span>
                          </div>
                          {trip.preferences && trip.preferences.length > 0 && (
                            <div className="mb-1">
                              <span className="font-semibold text-[#4DA8DA]">Preferencias:</span>
                              <span className="ml-2 text-gray-700">
                                {Array.isArray(trip.preferences)
                                  ? trip.preferences.join(', ')
                                  : trip.preferences}
                              </span>
                            </div>
                          )}
                          {trip.email && (
                            <div className="text-gray-500 text-xs">
                              <span className="font-semibold">Email:</span> {trip.email}
                            </div>
                          )}
                          {trip.status && (
                            <div className="mt-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                trip.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                trip.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {trip.status === 'PENDING' ? 'Pendiente' :
                                 trip.status === 'CONFIRMED' ? 'Confirmado' :
                                 trip.status === 'CANCELLED' ? 'Cancelado' : trip.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
};

export default ProfilePage;