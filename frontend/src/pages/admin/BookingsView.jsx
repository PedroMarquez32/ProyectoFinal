import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      const response = await fetch('http://localhost:5000/api/bookings', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error fetching bookings');
      
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error:', error);
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
        onClick={() => {
          setEditingBooking(booking);
          setShowEditModal(true);
        }}
        className="px-3 py-1 rounded text-sm font-medium bg-[#4DA8DA] text-white hover:bg-[#3a8bb9]"
      >
        Edit
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-[#3a3a3c] min-h-screen fixed left-0">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="TravelDream" className="w-8 h-8" />
            <span className="font-bold text-white">TravelDream</span>
          </div>
          <div className="text-sm text-gray-400">Admin Dashboard</div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/admin" className="flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">dashboard</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">people</span>
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/destinations" className="flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">place</span>
                <span>Destinations</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/bookings" className="flex items-center gap-3 p-2 text-white bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">book</span>
                <span>Bookings</span>
              </Link>
            </li>
          </ul>
        </nav>

        {user && (
          <div className="absolute bottom-0 p-4 w-64 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4DA8DA] rounded-full flex items-center justify-center text-white">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{user.username}</div>
                <div className="text-xs text-gray-400">Administrator</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
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
                    <td className="px-6 py-4">{booking.Trip?.title}</td>
                    <td className="px-6 py-4">{booking.User?.username}</td>
                    <td className="px-6 py-4">
                      {new Date(booking.start_date).toLocaleDateString()} - 
                      {new Date(booking.end_date).toLocaleDateString()}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customTrips.map((trip) => (
                  <tr key={trip.id} className="text-gray-900">
                    <td className="px-6 py-4">{trip.destination}</td>
                    <td className="px-6 py-4">{trip.User?.username}</td>
                    <td className="px-6 py-4">{trip.budget_per_person}€</td>
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
              <form onSubmit={handleEditBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={editingBooking.start_date?.split('T')[0]}
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
                    value={editingBooking.end_date?.split('T')[0]}
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