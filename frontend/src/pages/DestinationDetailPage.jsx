import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FavoriteButton from '../components/FavoriteButton';
import ReviewSection from '../components/ReviewSection';
import PageTransition from '../components/PageTransition';
import ZoomPageTransition from '../components/ZoomPageTransition';

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
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNewBooking, setIsNewBooking] = useState(false);

  // Modificar el checkBookingStatus
  const checkBookingStatus = async () => {
    if (!user || !id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/status/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error checking booking status');
      
      const data = await response.json();
      if (data.status !== bookingStatus) {
        setBookingStatus(data.status);
        
        if (data.booking) {
          setCurrentBooking({
            id: data.booking.id,
            startDate: new Date(data.booking.departure_date).toISOString().split('T')[0],
            endDate: new Date(data.booking.return_date).toISOString().split('T')[0],
            roomType: data.booking.room_type,
            guests: data.booking.number_of_participants.toString(),
            total_price: data.booking.total_price
          });
        }
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  };

  // Efectos separados y organizados
  useEffect(() => {
    const init = async () => {
      await fetchUserData();
      await fetchDestination();
    };
    init();
  }, []);

  // Reemplazar el useEffect que maneja el checkBookingStatus
  useEffect(() => {
    if (user && id) {
      // Hacer una sola comprobación inicial
      checkBookingStatus();
      
      // Cargar datos guardados del localStorage si no hay una reserva activa
      const savedForm = localStorage.getItem(`bookingForm_${id}_${user.id}`);
      if (savedForm && !bookingStatus) {
        const parsedForm = JSON.parse(savedForm);
        setBookingForm(parsedForm);
      }

      // Establecer un intervalo más largo (por ejemplo, cada 30 segundos) 
      // solo si la reserva está pendiente
      const interval = setInterval(() => {
        if (bookingStatus === 'PENDING') {
          checkBookingStatus();
        }
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [user, id, bookingStatus]);

  useEffect(() => {
    setIsFormDisabled(bookingStatus !== null && bookingStatus !== 'CANCELLED');
  }, [bookingStatus]);

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

  const fetchDestination = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Asegurarse de que la URL de la imagen es completa
      const formattedData = {
        ...data,
        image_url: data.image || 'https://via.placeholder.com/1200x800?text=No+Image+Available',
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
      const bookingData = {
        trip_id: destination.id,
        departure_date: bookingForm.startDate,
        return_date: bookingForm.endDate,
        room_type: bookingForm.roomType,
        number_of_participants: parseInt(bookingForm.guests),
        total_price: parseFloat(calculateTotal()),
        special_requests: ''
      };

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Actualizar inmediatamente el estado y la información
        setBookingStatus('PENDING');
        setCurrentBooking({ 
          id: data.id,
          ...bookingData
        });
        localStorage.setItem(`bookingForm_${id}_${user.id}`, JSON.stringify(bookingForm));
        
        // Forzar una actualización inmediata
        checkBookingStatus();
        
        alert('¡Reserva realizada con éxito! Estado: Pendiente de aprobación');
        setIsNewBooking(false);
      } else {
        throw new Error(data.message || 'Error al realizar la reserva');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };


  // Actualizar el handleNewBooking
  const handleNewBooking = () => {
    setIsProcessing(true);
    setBookingStatus(null);
    setCurrentBooking(null);
    setBookingForm({
      startDate: '',
      endDate: '',
      roomType: '',
      guests: ''
    });
    if (user) {
      localStorage.removeItem(`bookingForm_${id}_${user.id}`);
    }
    setIsFormDisabled(false);
    setIsProcessing(false);
    setIsNewBooking(true);
  };

  const renderBookingButton = () => {
    if (isNewBooking) {
      return (
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-[#4DA8DA] text-white py-2 rounded-lg hover:bg-[#3a8bb9] transition-colors font-medium"
        >
          {isProcessing ? 'Procesando...' : 'Reservar Ahora'}
        </button>
      );
    }
    switch (bookingStatus) {
      case 'CONFIRMED':
        return (
          <button
            disabled
            className="w-full bg-green-500 text-white py-2 rounded-lg font-medium cursor-not-allowed"
          >
            Reserva Confirmada
          </button>
        );
      case 'PENDING':
        return (
          <button
            disabled
            className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium cursor-not-allowed"
          >
            Reserva Pendiente
          </button>
        );
      case 'CANCELLED':
        return (
          <div className="space-y-2">
            <button
              disabled
              className="w-full bg-red-500 text-white py-2 rounded-lg font-medium cursor-not-allowed"
            >
              Reserva Cancelada
            </button>
            <button
              onClick={handleNewBooking}
              disabled={isProcessing}
              className="w-full bg-[#4DA8DA] text-white py-2 rounded-lg hover:bg-[#3a8bb9] transition-colors font-medium"
            >
              {isProcessing ? 'Procesando...' : 'Realizar Nueva Reserva'}
            </button>
          </div>
        );
      default:
        return (
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#4DA8DA] text-white py-2 rounded-lg hover:bg-[#3a8bb9] transition-colors font-medium"
          >
            {isProcessing ? 'Procesando...' : 'Reservar Ahora'}
          </button>
        );
    }
  };

  // Modificar renderFormInputs para mostrar los datos correctamente
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
      <div className="bg-white rounded-2xl p-8 shadow-md mb-6 border border-[#f3e6d0]">
        <h2 className="text-2xl font-bold mb-4 text-[#4DA8DA] text-left">Descripción General</h2>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">{destination.overview || destination.description}</p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500">Duración:</p>
            <p className="text-gray-900 font-semibold">{destination.duration} días</p>
          </div>
          <div>
            <p className="text-gray-500">Valoración:</p>
            <p className="text-gray-900 font-semibold">{destination.rating}/5 ⭐</p>
          </div>
          <div>
            <p className="text-gray-500">Precio desde:</p>
            <p className="text-gray-900 font-semibold">{destination.price}€</p>
          </div>
          <div>
            <p className="text-gray-500">Máximo participantes:</p>
            <p className="text-gray-900 font-semibold">{destination.max_participants} personas</p>
          </div>
        </div>
      </div>

      {/* Destacados del Viaje */}
      <div className="bg-white rounded-2xl p-8 shadow-md mb-6 border border-[#f3e6d0]">
        <h2 className="text-2xl font-bold mb-6 text-[#4DA8DA]">Destacados del Viaje</h2>
        <div className="grid grid-cols-2 gap-6">
          {destination.highlights?.map((highlight, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#4DA8DA] rounded-full flex items-center justify-center text-white shrink-0 shadow">
                ✓
              </div>
              <span className="text-gray-700">{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Itinerario */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f3e6d0]">
        <h2 className="text-2xl font-bold mb-6 text-[#4DA8DA]">Itinerario</h2>
        <div className="grid gap-6">
          {destination.itinerary?.map((day) => (
            <div key={day.day} className="bg-[#FDF6ED] rounded-xl p-6 shadow flex flex-col gap-2 border-l-4 border-[#4DA8DA]">
              <h3 className="text-xl font-semibold text-[#4DA8DA] mb-2">
                Día {day.day}: <span className="text-gray-800">{day.title}</span>
              </h3>
              <ul className="space-y-2 pl-2">
                {day.activities?.map((activity, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-[#4DA8DA] mt-1">•</span>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
    <ZoomPageTransition>
      <div className="min-h-screen bg-[#FDF6ED]">
        <Navbar />
        {destination ? (
          <>
            {/* Imagen principal */}
            <div className="relative h-[40vh] mb-12 overflow-hidden">
              <img
                src={destination.image_url}
                alt={destination.title}
                className="w-full h-full object-cover"
              />
              {/* Capa oscura para el texto */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                <div className="w-full pl-16 pb-10 text-left">
                  <h1 className="text-4xl font-extrabold text-white drop-shadow mb-1">{destination.title}</h1>
                  <p className="text-lg text-white">{destination.destination}</p>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna principal */}
              <div className="lg:col-span-2 space-y-8">
                {renderDestinationDetails()}
              </div>

              {/* Formulario de Reserva */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-md p-4 border border-[#f3e6d0] sticky top-24 max-h-[90vh] flex flex-col justify-between">
                  <h2 className="text-xl font-bold mb-2 text-[#4DA8DA] text-left">Detalles de la Reserva</h2>
                  <form onSubmit={handleBookingSubmit} className="flex flex-col space-y-2 flex-grow">
                    {renderFormInputs()}
                    {bookingForm.startDate && bookingForm.endDate && (
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duración del viaje</span>
                          <span className="font-medium text-gray-800">
                            {calculateNights(bookingForm.startDate, bookingForm.endDate)} noches
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold mt-1">
                          <span className="text-gray-800">Precio Total</span>
                          <span className="text-[#4DA8DA]">{calculateTotal()}€</span>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 flex flex-col gap-2">
                      {renderBookingButton()}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-screen bg-[#f6e7d7] flex items-center justify-center">
            <div className="text-2xl text-gray-600">
              Cargando destino...
            </div>
          </div>
        )}
        <Footer />
      </div>
    </ZoomPageTransition>
  );
};

export default DestinationDetailPage;