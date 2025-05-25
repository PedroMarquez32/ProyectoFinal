import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUserData();
    fetchBookings();
    fetchCustomTrips();
  }, []);

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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bookings', {
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
      const response = await fetch('http://localhost:5000/api/custom-trips', {
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
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
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
      const response = await fetch(`http://localhost:5000/api/custom-trips/${tripId}`, {
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
      const response = await fetch(`http://localhost:5000/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          start_date: editingBooking.start_date,
          end_date: editingBooking.end_date,
          room_type: editingBooking.room_type,
          number_of_participants: editingBooking.number_of_participants,
          total_price: editingBooking.total_price,
          special_requests: editingBooking.special_requests
        })
      });

      if (!response.ok) throw new Error('Error updating booking');

      await fetchBookings();
      setShowEditModal(false);
      setEditingBooking(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la reserva');
    }
  };

  const handleEditCustomTrip = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/custom-trips/${editingCustomTrip.id}`, {
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
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Error deleting booking');
        await fetchBookings();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la reserva');
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
    <div className="space-x-2">
      <button
        onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
        className={`px-3 py-1 rounded text-sm font-medium ${
          booking.status === 'CONFIRMED'
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white'
        }`}
      >
        Accept
      </button>
      <button
        onClick={() => handleStatusChange(booking.id, 'PENDING')}
        className={`px-3 py-1 rounded text-sm font-medium ${
          booking.status === 'PENDING'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-yellow-500 hover:text-white'
        }`}
      >
        Pending
      </button>
      <button
        onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
        className={`px-3 py-1 rounded text-sm font-medium ${
          booking.status === 'CANCELLED'
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'
        }`}
      >
        Cancel
      </button>
      <button
        onClick={() => handleEdit(booking)}
        className="px-3 py-1 rounded text-sm font-medium bg-[#4DA8DA] text-white hover:bg-[#3a8bb9]"
      >
        Edit
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={user} />
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <button
              className={`py-2 px-4 mr-4 ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-[#4DA8DA] text-[#4DA8DA] font-medium bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              Regular Bookings
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === 'custom'
                  ? 'border-b-2 border-[#4DA8DA] text-[#4DA8DA] font-medium bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('custom')}
            >
              Custom Trips
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-center py-4 text-gray-900">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4DA8DA]"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="text-gray-900">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={booking.Trip?.image || '/placeholder-image.jpg'} 
                          alt={booking.Trip?.title || 'Destino'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">{booking.Trip?.title || 'Destino no disponible'}</div>
                          <div className="text-sm text-gray-500">{booking.Trip?.destination || 'Ubicación no disponible'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {booking.user?.username || 'Usuario no disponible'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user?.email || 'Email no disponible'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{new Date(booking.departure_date).toLocaleDateString('es-ES')}</div>
                      <div>{new Date(booking.return_date).toLocaleDateString('es-ES')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {renderActionButtons(booking)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customTrips.map((trip) => (
                  <tr key={trip.id} className="text-gray-900">
                    {/* Custom Trips Table */}
                    <td className="px-6 py-4">{trip.destination}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{trip.User?.username || 'Usuario no disponible'}</div>
                      <div className="text-sm text-gray-500">{trip.User?.email || 'Email no disponible'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{new Date(trip.departure_date).toLocaleDateString('es-ES')}</div>
                      <div>{new Date(trip.return_date).toLocaleDateString('es-ES')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-x-2">
                        <button
                          onClick={() => handleCustomTripStatusChange(trip.id, 'APPROVED')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            trip.status === 'APPROVED'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleCustomTripStatusChange(trip.id, 'PENDING')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            trip.status === 'PENDING'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-yellow-500 hover:text-white'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleCustomTripStatusChange(trip.id, 'CANCELLED')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            trip.status === 'CANCELLED'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setEditingCustomTrip(trip);
                            setShowCustomTripModal(true);
                          }}
                          className="px-3 py-1 rounded text-sm font-medium bg-[#4DA8DA] text-white hover:bg-[#3a8bb9]"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

                <div className="flex justify-end space-x-2 mt-4 border-t pt-4">
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
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
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
              <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Custom Trip</h2>
              <form onSubmit={handleEditCustomTrip} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Destination</label>
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">Number of Participants</label>
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">Budget per Person</label>
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">Accommodation Type</label>
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

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomTripModal(false);
                      setEditingCustomTrip(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#4DA8DA] text-white rounded hover:bg-[#3a8bb9]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsView;