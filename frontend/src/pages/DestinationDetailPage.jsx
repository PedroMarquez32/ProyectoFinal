import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FavoriteButton from '../components/FavoriteButton';
import ReviewSection from '../components/ReviewSection';

const DestinationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
    roomType: '',
    guests: '',
  });
  const [bookingStatus, setBookingStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchDestination();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const savedForm = localStorage.getItem(`bookingForm_${id}_${user.id}`);
      if (savedForm) {
        setBookingForm(JSON.parse(savedForm));
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (user && (bookingForm.startDate || bookingForm.endDate || bookingForm.roomType || bookingForm.guests)) {
      localStorage.setItem(`bookingForm_${id}_${user.id}`, JSON.stringify(bookingForm));
    }
  }, [bookingForm, id, user]);

  useEffect(() => {
    const checkBookingStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/status/${id}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setBookingStatus(data.status);
          
          // No limpiar el formulario si el estado es PENDING
          if (data.status === 'CANCELLED') {
            setBookingForm({
              startDate: '',
              endDate: '',
              roomType: '',
              guests: ''
            });
          }
        }
      } catch (error) {
        console.error('Error checking booking status:', error);
      }
    };

    if (destination && user) {
      checkBookingStatus();
    }
  }, [destination, id, user]);

  useEffect(() => {
    return () => {
      if (bookingStatus === 'CANCELLED' && user) {
        localStorage.removeItem(`bookingForm_${id}_${user.id}`);
      }
    };
  }, [id, bookingStatus, user]);

  useEffect(() => {
    setIsFormDisabled(bookingStatus !== null);
  }, [bookingStatus]);

  const fetchDestination = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Asegurarse de que highlights e itinerary están formateados correctamente
      const formattedData = {
        ...data,
        overview: data.overview || data.description || '',
        highlights: Array.isArray(data.highlights) 
          ? data.highlights 
          : typeof data.highlights === 'string'
            ? data.highlights.split(',')
            : [],
        itinerary: Array.isArray(data.itinerary) 
          ? data.itinerary 
          : typeof data.itinerary === 'string'
            ? JSON.parse(data.itinerary)
            : []
      };

      // Formatear el itinerario
      const formattedItinerary = formattedData.itinerary.map(day => ({
        day: parseInt(day.day),
        title: day.title || `Día ${day.day}`,
        activities: Array.isArray(day.activities) ? day.activities : []
      })).sort((a, b) => a.day - b.day);

      const finalData = {
        ...formattedData,
        highlights: formattedData.highlights,
        itinerary: formattedItinerary
      };

      console.log('Formatted destination data:', finalData); // Para depuración
      setDestination(finalData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching destination:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const calculateNights = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!destination || !bookingForm.startDate || !bookingForm.endDate || !bookingForm.guests) return 0;
    
    const basePrice = parseFloat(destination.price) || 0;
    const nights = calculateNights(bookingForm.startDate, bookingForm.endDate);
    const guests = parseInt(bookingForm.guests) || 1;
    
    const subtotal = basePrice * nights * guests;
    const taxes = subtotal * 0.21;
    const total = subtotal + taxes;
    
    return total.toFixed(2);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para realizar una reserva');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          trip_id: destination.id,
          departure_date: bookingForm.startDate,    // Cambiado de start_date a departure_date
          return_date: bookingForm.endDate,         // Cambiado de end_date a return_date
          room_type: bookingForm.roomType,
          number_of_participants: parseInt(bookingForm.guests),
          total_price: parseFloat(calculateTotal()),
          special_requests: '' // Campo opcional
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setBookingStatus('PENDING');
        localStorage.setItem(`bookingForm_${id}_${user.id}`, JSON.stringify(bookingForm));
        alert('Reserva realizada con éxito. Estado: Pendiente de aprobación');
      } else {
        throw new Error(data.message || 'Error al realizar la reserva');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const renderBookingButton = () => {
    switch (bookingStatus) {
      case 'PENDING':
        return (
          <button
            disabled
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium cursor-not-allowed"
          >
            Reserva Pendiente
          </button>
        );
      case 'CONFIRMED':
        return (
          <button
            disabled
            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium cursor-not-allowed"
          >
            Reserva Confirmada
          </button>
        );
      case 'CANCELLED':
        return (
          <button
            disabled
            className="w-full bg-red-500 text-white py-3 rounded-lg font-medium cursor-not-allowed"
          >
            Reserva Cancelada
          </button>
        );
      default:
        return (
          <button
            type="submit"
            className="w-full bg-[#4DA8DA] text-white py-3 rounded-lg hover:bg-[#3a8bb9] transition-colors font-medium"
          >
            Reservar Ahora
          </button>
        );
    }
  };

  const renderFormInputs = () => {
    if (!user) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Debes iniciar sesión para realizar una reserva</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#4DA8DA] text-white px-6 py-2 rounded hover:bg-[#3a8bb9]"
          >
            Iniciar Sesión
          </button>
        </div>
      );
    }

    return (
      <div className={`space-y-4 ${isFormDisabled ? 'opacity-75' : ''}`}>
        <div>
          <label className="block text-gray-900 font-medium mb-2">
            Seleccionar Fechas
          </label>
          <input
            type="date"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#4DA8DA] bg-white text-gray-900"
            value={bookingForm.startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setBookingForm({...bookingForm, startDate: e.target.value})}
            required
            disabled={isFormDisabled}
          />
        </div>

        <div>
          <input
            type="date"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#4DA8DA] bg-white text-gray-900"
            value={bookingForm.endDate}
            min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
            onChange={(e) => setBookingForm({...bookingForm, endDate: e.target.value})}
            required
            disabled={isFormDisabled}
          />
        </div>

        <div>
          <label className="block text-gray-900 font-medium mb-2">
            Tipo de Habitación
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#4DA8DA] bg-white text-gray-900"
            value={bookingForm.roomType}
            onChange={(e) => setBookingForm({...bookingForm, roomType: e.target.value})}
            required
            disabled={isFormDisabled}
          >
            <option value="">Seleccionar tipo de habitación</option>
            <option value="standard">Vista Caldera Estándar</option>
            <option value="superior">Vista Mar Superior</option>
            <option value="deluxe">Suite Deluxe</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-900 font-medium mb-2">
            Número de Huéspedes
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#4DA8DA] bg-white text-gray-900"
            value={bookingForm.guests}
            onChange={(e) => setBookingForm({...bookingForm, guests: e.target.value})}
            required
            disabled={isFormDisabled}
          >
            <option value="">Seleccionar número de huéspedes</option>
            <option value="1">1 Persona</option>
            <option value="2">2 Personas</option>
            <option value="3">3 Personas</option>
            <option value="4">4 Personas</option>
          </select>
        </div>

        {bookingForm.startDate && bookingForm.endDate && bookingForm.guests && (
          <div className="space-y-4 mt-6 bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-900">Precio base por persona/noche</span>
              <span className="font-medium text-[#4DA8DA]">{destination.price}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Número de noches</span>
              <span className="font-medium text-[#4DA8DA]">
                {calculateNights(bookingForm.startDate, bookingForm.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Número de personas</span>
              <span className="font-medium text-[#4DA8DA]">{bookingForm.guests}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-4 border-t">
              <span className="text-gray-900">Precio Total</span>
              <span className="text-[#4DA8DA]">{calculateTotal()}€</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDestinationDetails = () => (
    <div className="lg:col-span-2">
      {/* Descripción General */}
      <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-[#3a3a3c]">Descripción General</h2>
        <p className="text-gray-700 mb-6">{destination.overview || destination.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Duración:</p>
            <p className="text-gray-900 font-medium">{destination.duration} días</p>
          </div>
          <div>
            <p className="text-gray-600">Valoración:</p>
            <p className="text-gray-900 font-medium">{destination.rating}/5 ⭐</p>
          </div>
          <div>
            <p className="text-gray-600">Precio desde:</p>
            <p className="text-gray-900 font-medium">{destination.price}€</p>
          </div>
          <div>
            <p className="text-gray-600">Máximo participantes:</p>
            <p className="text-gray-900 font-medium">{destination.max_participants} personas</p>
          </div>
        </div>
      </div>

      {/* Destacados del Viaje */}
      <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-6 text-[#3a3a3c]">Destacados del Viaje</h2>
        <div className="grid grid-cols-2 gap-6">
          {Array.isArray(destination.highlights) && destination.highlights.length > 0 ? (
            destination.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#4DA8DA] rounded-full flex items-center justify-center text-white shrink-0">
                  ✓
                </div>
                <span className="text-gray-700 leading-tight">{highlight}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-700">No hay destacados disponibles.</p>
          )}
        </div>
      </div>

      {/* Itinerario */}
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-[#3a3a3c]">Itinerario</h2>
        <div className="space-y-6">
          {destination.itinerary && Array.isArray(destination.itinerary) && destination.itinerary.length > 0 ? (
            destination.itinerary
              .sort((a, b) => a.day - b.day)
              .map((day) => (
                <div key={day.day} className="border-b pb-6 last:border-0">
                  <h3 className="text-xl font-semibold mb-3 text-[#3a3a3c]">
                    Día {day.day}: {day.title}
                  </h3>
                  <ul className="space-y-2">
                    {day.activities?.map((activity, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <span className="text-[#4DA8DA] mt-1">•</span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          ) : (
            <p className="text-gray-700">No hay itinerario disponible.</p>
          )}
        </div>
      </div>

      {/* Sección de Reseñas */}
      <ReviewSection tripId={id} user={user} />
    </div>
  );

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-[#f6e7d7] flex items-center justify-center">
        <div className="text-2xl text-gray-600">
          {error || 'Destino no encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6e7d7]">
      <Navbar />
      
      <div className="relative h-[400px]">
        <img
          src={destination.image}
          alt={destination.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-4">{destination.title}</h1>
              <div className="flex items-center gap-6 text-lg">
                <span>⏱ {destination.duration}</span>
                <span>⭐ {destination.rating}</span>
                <span>💶 Desde {destination.price}€</span>
              </div>
            </div>
            <div>
              <FavoriteButton tripId={destination.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {renderDestinationDetails()}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-lg sticky top-4">
              <h3 className="text-xl font-bold mb-6 text-[#3a3a3c]">
                {isFormDisabled ? 'Detalles de la Reserva' : 'Reservar este Viaje'}
              </h3>
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {renderFormInputs()}

                {bookingForm.startDate && bookingForm.endDate && (
                  <div className="border-t pt-6 mt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-[#3a3a3c]">Duración del viaje</span>
                      <span className="font-medium text-[#3a3a3c]">
                        {calculateNights(bookingForm.startDate, bookingForm.endDate)} noches
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-4">
                      <span className="text-[#3a3a3c]">Precio Total</span>
                      <span className="text-[#4DA8DA]">{calculateTotal()}€</span>
                    </div>
                  </div>
                )}

                {renderBookingButton()}
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DestinationDetailPage;