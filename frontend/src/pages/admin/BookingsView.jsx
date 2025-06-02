import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageTransition from '../../components/common/PageTransition';
import { buttonStyles } from '../../styles/buttons';


const BookingsView = () => {
  const [bookings, setBookings] = useState([]);
  const [customTrips, setCustomTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [user, setUser] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomTrip, setEditingCustomTrip] = useState(null);
  const [showCustomTripModal, setShowCustomTripModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUserData();
    fetchBookings();
    fetchCustomTrips();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error fetching bookings');
      }
      
      const data = await response.json();
      
      const formattedBookings = data.map(booking => {
        try {
          const departureDate = booking.departure_date ? new Date(booking.departure_date) : null;
          const returnDate = booking.return_date ? new Date(booking.return_date) : null;

          return {
            ...booking,
            username: booking.User?.username || 'Usuario no disponible',
            userEmail: booking.User?.email || 'Email no disponible',
            start_date: departureDate ? departureDate.toLocaleDateString('es-ES') : 'No disponible',
            end_date: returnDate ? returnDate.toLocaleDateString('es-ES') : 'No disponible',
            originalStartDate: departureDate ? departureDate.toISOString().split('T')[0] : '',
            originalEndDate: returnDate ? returnDate.toISOString().split('T')[0] : '',
            Trip: booking.Trip || {},
            User: booking.User || {}
          };
        } catch (error) {
          console.error('Error formatting booking:', error);
          return booking;
        }
      });
      
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomTrips = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/custom-trips`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error fetching custom trips');
      
      const data = await response.json();
      setCustomTrips(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Error updating booking status');
      
      setBookings(bookings.map(booking => {
        if (booking.id === bookingId) {
          return {
            ...booking,
            status: newStatus
          };
        }
        return booking;
      }));

      await fetchBookings();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado de la reserva');
    }
  };

  const handleCustomTripStatusChange = async (tripId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/custom-trips/${tripId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Error updating custom trip status');
      await fetchCustomTrips();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado del viaje personalizado');
    }
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          departure_date: editingBooking.start_date,
          return_date: editingBooking.end_date,
          room_type: editingBooking.room_type,
          number_of_participants: editingBooking.number_of_participants,
          total_price: editingBooking.total_price,
          special_requests: editingBooking.special_requests
        })
      });

      if (!response.ok) throw new Error('Error updating booking');

      // Forzar actualización inmediata
      await fetchBookings();
      setShowEditModal(false);
      setEditingBooking(null);

      // Emitir evento para actualizar otras vistas
      window.dispatchEvent(new CustomEvent('booking-updated'));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la reserva');
    }
  };

  const handleEditCustomTrip = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/custom-trips/${editingCustomTrip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editingCustomTrip)
      });

      if (!response.ok) throw new Error('Error updating custom trip');
      await fetchCustomTrips();
      setShowCustomTripModal(false);
      setEditingCustomTrip(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el viaje personalizado');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Error al eliminar la reserva');
        }

        // Actualizar la lista de reservas
        await fetchBookings();
        setShowEditModal(false);
        setEditingBooking(null);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la reserva');
      }
    }
  };

  // Añadir esta función para manejar el borrado de custom trips
  const handleDeleteCustomTrip = async (tripId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este viaje personalizado? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/custom-trips/${tripId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al eliminar el viaje personalizado');
        }

        await fetchCustomTrips();
        setShowCustomTripModal(false);
        setEditingCustomTrip(null);
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al eliminar el viaje personalizado');
      }
    }
  };

  const handleEdit = (booking) => {
    try {
      const formattedBooking = {
        id: booking.id,
        start_date: booking.originalStartDate || '',
        end_date: booking.originalEndDate || '',
        room_type: booking.room_type || '',
        number_of_participants: booking.number_of_participants || 1,
        total_price: booking.total_price || 0,
        special_requests: booking.special_requests || '',
        Trip: booking.Trip || {},
        User: booking.User || {},
        status: booking.status
      };
      
      setEditingBooking(formattedBooking);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error formatting booking data:', error);
    }
  };

  const renderActionButtons = (booking) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
        className={`${buttonStyles.statusButton.base} ${buttonStyles.statusButton.confirmed} 
          ${booking.status === 'CONFIRMED' ? buttonStyles.statusButton.active : ''}`}
      >
        Confirmar
      </button>
      <button
        onClick={() => handleStatusChange(booking.id, 'PENDING')}
        className={`${buttonStyles.statusButton.base} ${buttonStyles.statusButton.pending}
          ${booking.status === 'PENDING' ? buttonStyles.statusButton.active : ''}`}
      >
        Pendiente
      </button>
      <button
        onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
        className={`${buttonStyles.statusButton.base} ${buttonStyles.statusButton.cancelled}
          ${booking.status === 'CANCELLED' ? buttonStyles.statusButton.active : ''}`}
      >
        Cancelar
      </button>
      <button
        onClick={() => handleEdit(booking)}
        className={buttonStyles.editButton}
      >
        Editar
      </button>
    </div>
  );

  // Añadir esta función para filtrar las reservas
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.Trip?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.Trip?.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.User?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.User?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Añadir esta función para filtrar los custom trips
  const filteredCustomTrips = customTrips.filter(trip => {
    const matchesSearch = 
      trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.User?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.User?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || trip.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={user} />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold mb-6 text-[#3a3a3c]">Gestión de Reservas</h1>
            <div className="flex justify-center items-center h-64">
              {/* Contenido vacío mientras carga */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={user} />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold mb-6 text-[#3a3a3c]">Gestión de Reservas</h1>
            
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`${
                      activeTab === 'bookings'
                        ? 'border-[#4DA8DA] text-[#4DA8DA]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Reservas
                  </button>
                  <button
                    onClick={() => setActiveTab('customTrips')}
                    className={`${
                      activeTab === 'customTrips'
                        ? 'border-[#4DA8DA] text-[#4DA8DA]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Viajes Personalizados
                  </button>
                </nav>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por destino, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4DA8DA] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4DA8DA] focus:border-transparent text-gray-900"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="CONFIRMED">Confirmados</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="CANCELLED">Cancelados</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow">
              {activeTab === 'bookings' ? (
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                      {/* Contenido vacío mientras carga */}
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      {/* ... contenido de la tabla ... */}
                    </table>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                      {/* Contenido vacío mientras carga */}
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      {/* ... contenido de la tabla de viajes personalizados ... */}
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Edit Booking Modal */}
            {showEditModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Editar Reserva</h2>
                  
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <img 
                        src={editingBooking.Trip?.image || '/placeholder-image.jpg'} 
                        alt={editingBooking.Trip?.title}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{editingBooking.Trip?.title}</div>
                        <div className="text-sm text-gray-500">{editingBooking.Trip?.destination}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Usuario: {editingBooking.User?.username}</div>
                      <div>Email: {editingBooking.User?.email}</div>
                    </div>
                  </div>

                  <form onSubmit={handleEditBooking} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Fecha de Inicio</label>
                      <input
                        type="date"
                        value={editingBooking.start_date}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          start_date: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Fecha de Fin</label>
                      <input
                        type="date"
                        value={editingBooking.end_date}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          end_date: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Tipo de Habitación</label>
                      <select
                        value={editingBooking.room_type || ''}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          room_type: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      >
                        <option value="">Seleccionar tipo de habitación</option>
                        <option value="standard">Vista Caldera Estándar</option>
                        <option value="superior">Vista Mar Superior</option>
                        <option value="deluxe">Suite Deluxe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Número de Huéspedes</label>
                      <input
                        type="number"
                        value={editingBooking.number_of_participants || ''}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          number_of_participants: parseInt(e.target.value)
                        })}
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Peticiones Especiales</label>
                      <textarea
                        value={editingBooking.special_requests || ''}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          special_requests: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                        rows="3"
                      />
                    </div>

                    <div className="flex justify-center space-x-4 mt-4 border-t pt-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteBooking(editingBooking.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Eliminar Reserva
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingBooking(null);
                        }}
                        className="px-4 py-2 bg-[#1a1a1a] text-white rounded hover:bg-gray-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#4DA8DA] text-white rounded hover:bg-[#3a8bb9]"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Custom Trip Edit Modal */}
            {showCustomTripModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Editar Viaje Personalizado</h2>
                  
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <div>Usuario: {editingCustomTrip.User?.username}</div>
                      <div>Email: {editingCustomTrip.User?.email}</div>
                    </div>
                  </div>

                  <form onSubmit={handleEditCustomTrip} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Destino</label>
                      <input
                        type="text"
                        value={editingCustomTrip.destination}
                        onChange={(e) => setEditingCustomTrip({
                          ...editingCustomTrip,
                          destination: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Fecha de Inicio</label>
                      <input
                        type="date"
                        value={editingCustomTrip.departure_date}
                        onChange={(e) => setEditingCustomTrip({
                          ...editingCustomTrip,
                          departure_date: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Fecha de Fin</label>
                      <input
                        type="date"
                        value={editingCustomTrip.return_date}
                        onChange={(e) => setEditingCustomTrip({
                          ...editingCustomTrip,
                          return_date: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Número de Participantes</label>
                      <input
                        type="number"
                        value={editingCustomTrip.number_of_participants}
                        onChange={(e) => setEditingCustomTrip({
                          ...editingCustomTrip,
                          number_of_participants: parseInt(e.target.value)
                        })}
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Presupuesto por Persona</label>
                      <input
                        type="number"
                        value={editingCustomTrip.budget_per_person}
                        onChange={(e) => setEditingCustomTrip({
                          ...editingCustomTrip,
                          budget_per_person: parseFloat(e.target.value)
                        })}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Tipo de Alojamiento</label>
                      <select
                        value={editingCustomTrip.accommodation_type}
                        onChange={(e) => setEditingCustomTrip({
                          ...editingCustomTrip,
                          accommodation_type: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DA8DA] focus:ring-[#4DA8DA] text-gray-900"
                      >
                        <option value="Hotel">Hotel</option>
                        <option value="Resort">Resort</option>
                        <option value="Villa">Villa</option>
                        <option value="Apartamento">Apartamento</option>
                      </select>
                    </div>

                    {/* Reemplazar la sección de los botones del Custom Trip Modal */}
                    <div className="flex justify-center space-x-4 mt-4 border-t pt-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomTrip(editingCustomTrip.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Eliminar Viaje
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomTripModal(false);
                          setEditingCustomTrip(null);
                        }}
                        className="px-4 py-2 bg-[#1a1a1a] text-white rounded hover:bg-gray-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#4DA8DA] text-white rounded hover:bg-[#3a8bb9]"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BookingsView;