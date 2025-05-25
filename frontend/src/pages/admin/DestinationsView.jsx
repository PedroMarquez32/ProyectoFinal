import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const DestinationsView = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDestination, setEditingDestination] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState(null);
  const [itineraryDays, setItineraryDays] = useState([
    { day: 1, title: '', activities: [''] }
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchDestinations();
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

  const fetchDestinations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trips', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error fetching destinations');
      }
      
      const data = await response.json();
      setDestinations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Cuando se inicia la edición
  const handleEdit = (destination) => {
    // Asegurarse de que existe el itinerario o usar un array vacío por defecto
    const formattedItinerary = destination.itinerary ? destination.itinerary.map(day => ({
      day: day.day,
      title: day.title,
      activities: day.activities
    })) : [{ day: 1, title: '', activities: [''] }];
    
    setItineraryDays(formattedItinerary);
    setEditingDestination({
      ...destination,
      highlights: destination.highlights ? destination.highlights.join('\n') : ''
    });
    setShowEditModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={user} />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#3a3a3c]">Destinations Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#4DA8DA] text-white px-4 py-2 rounded-lg hover:bg-[#3a8bb9]"
          >
            Add New Destination
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {destinations.map(destination => (
                    <tr key={destination.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">
                        {editingDestination?.id === destination.id ? (
                          <input
                            type="text"
                            value={editingDestination.title}
                            onChange={(e) => setEditingDestination({
                              ...editingDestination,
                              title: e.target.value
                            })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          destination.title
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">
                        {editingDestination?.id === destination.id ? (
                          <input
                            type="text"
                            value={editingDestination.destination}
                            onChange={(e) => setEditingDestination({
                              ...editingDestination,
                              destination: e.target.value
                            })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          destination.destination
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">
                        {editingDestination?.id === destination.id ? (
                          <input
                            type="number"
                            value={editingDestination.price}
                            onChange={(e) => setEditingDestination({
                              ...editingDestination,
                              price: parseFloat(e.target.value)
                            })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          `${destination.price}€`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">
                        {editingDestination?.id === destination.id ? (
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={editingDestination.rating}
                            onChange={(e) => setEditingDestination({
                              ...editingDestination,
                              rating: parseFloat(e.target.value)
                            })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          `⭐ ${destination.rating}`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingDestination?.id === destination.id ? (
                          <div className="space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  const updatedData = {
                                    ...editingDestination,
                                    highlights: editingDestination.highlights.split('\n').filter(h => h.trim() !== ''),
                                    itinerary: typeof editingDestination.itinerary === 'string' 
                                      ? JSON.parse(editingDestination.itinerary)
                                      : editingDestination.itinerary
                                  };

                                  const response = await fetch(`http://localhost:5000/api/trips/${editingDestination.id}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify(updatedData)
                                  });

                                  if (!response.ok) {
                                    throw new Error('Error updating destination');
                                  }

                                  await fetchDestinations();
                                  setEditingDestination(null);
                                } catch (error) {
                                  console.error('Error:', error);
                                  alert('Error updating destination');
                                }
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingDestination(null)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="space-x-2">
                            <button
                              onClick={() => handleEdit(destination)}
                              className="text-[#4DA8DA] hover:text-[#3a8bb9]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this destination?')) {
                                  try {
                                    const response = await fetch(`http://localhost:5000/api/trips/${destination.id}`, {
                                      method: 'DELETE',
                                      credentials: 'include'
                                    });

                                    if (!response.ok) {
                                      throw new Error('Error deleting destination');
                                    }

                                    await fetchDestinations();
                                  } catch (error) {
                                    console.error('Error:', error);
                                    alert('Error deleting destination');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Destination Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4">
            <div className="bg-white p-8 rounded-lg w-full max-w-4xl my-8 relative">
              <div className="max-h-[80vh] overflow-y-auto pr-4">
                <h2 className="text-xl font-bold mb-4 text-[#3a3a3c] sticky top-0 bg-white py-2">
                  Add New Destination
                </h2>
                <form 
                  id="destination-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    
                    const highlights = formData.get('highlights')
                      .split('\n')
                      .filter(h => h.trim() !== '');

                    const itinerary = itineraryDays.map(day => ({
                      day: day.day,
                      title: day.title,
                      activities: day.activities.filter(a => a.trim() !== '')
                    }));

                    const newDestination = {
                      title: formData.get('title'),
                      destination: formData.get('destination'),
                      description: formData.get('description'),
                      price: parseFloat(formData.get('price')),
                      duration: parseInt(formData.get('duration')),
                      rating: parseFloat(formData.get('rating')) || 0,
                      image: formData.get('image') || null,
                      max_participants: parseInt(formData.get('max_participants')) || 20,
                      overview: formData.get('overview'),
                      highlights: highlights,
                      itinerary: itinerary,
                      is_active: true
                    };

                    try {
                      const response = await fetch('http://localhost:5000/api/trips', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(newDestination)
                      });

                      if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.message || 'Error creating destination');
                      }

                      await fetchDestinations();
                      setShowAddModal(false);
                      setItineraryDays([{ day: 1, title: '', activities: [''] }]); // Reset form
                    } catch (error) {
                      console.error('Error:', error);
                      alert(error.message || 'Error creating destination');
                    }
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter destination title"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Destination</label>
                    <input
                      type="text"
                      name="destination"
                      required
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter destination location"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      required
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter destination description"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Price</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Duration (days)</label>
                    <input
                      type="number"
                      name="duration"
                      required
                      min="1"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter duration in days"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Rating</label>
                    <input
                      type="number"
                      name="rating"
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter rating (0-5)"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Image URL (optional)</label>
                    <input
                      type="url"
                      name="image"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter image URL"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Max Participants</label>
                    <input
                      type="number"
                      name="max_participants"
                      min="1"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter maximum number of participants"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Overview</label>
                    <textarea
                      name="overview"
                      required
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter destination overview"
                      rows="4"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">
                      Highlights (one per line)
                    </label>
                    <textarea
                      name="highlights"
                      required
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      placeholder="Enter highlights, one per line"
                      rows="4"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">
                      Itinerary
                    </label>
                    <div className="space-y-4">
                      {itineraryDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-[#3a3a3c]">Day {day.day}</h4>
                            {itineraryDays.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newDays = itineraryDays.filter((_, i) => i !== dayIndex);
                                  setItineraryDays(newDays.map((d, i) => ({ ...d, day: i + 1 })));
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove Day
                              </button>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm mb-1 text-[#3a3a3c]">Day Title</label>
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => {
                                const newDays = [...itineraryDays];
                                newDays[dayIndex].title = e.target.value;
                                setItineraryDays(newDays);
                              }}
                              className="w-full border rounded p-2 text-[#3a3a3c]"
                              placeholder="Enter day title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm mb-1 text-[#3a3a3c]">Activities</label>
                            <div className="space-y-2">
                              {day.activities.map((activity, activityIndex) => (
                                <div key={activityIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={activity}
                                    onChange={(e) => {
                                      const newDays = [...itineraryDays];
                                      newDays[dayIndex].activities[activityIndex] = e.target.value;
                                      setItineraryDays(newDays);
                                    }}
                                    className="flex-1 border rounded p-2 text-[#3a3a3c]"
                                    placeholder={`Activity ${activityIndex + 1}`}
                                  />
                                  {day.activities.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newDays = [...itineraryDays];
                                        newDays[dayIndex].activities = day.activities.filter(
                                          (_, i) => i !== activityIndex
                                        );
                                        setItineraryDays(newDays);
                                      }}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                const newDays = [...itineraryDays];
                                newDays[dayIndex].activities.push('');
                                setItineraryDays(newDays);
                              }}
                              className="mt-2 text-[#4DA8DA] hover:text-[#3a8bb9]"
                            >
                              + Add Activity
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setItineraryDays([
                            ...itineraryDays,
                            {
                              day: itineraryDays.length + 1,
                              title: '',
                              activities: ['']
                            }
                          ]);
                        }}
                        className="w-full p-2 border border-dashed border-[#4DA8DA] text-[#4DA8DA] rounded-lg hover:bg-[#4DA8DA] hover:text-white transition-colors"
                      >
                        + Add Day
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="mt-4 flex justify-end gap-2 sticky bottom-0 bg-white pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[#3a3a3c] hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="destination-form"
                  className="px-4 py-2 bg-[#4DA8DA] text-white rounded hover:bg-[#3a8bb9]"
                >
                  Add Destination
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Destination Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4">
            <div className="bg-white p-8 rounded-lg w-full max-w-4xl my-8 relative">
              <div className="max-h-[80vh] overflow-y-auto pr-4">
                <h2 className="text-xl font-bold mb-4 text-[#3a3a3c] sticky top-0 bg-white py-2">
                  Edit Destination
                </h2>
                <form 
                  id="edit-destination-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const updatedData = {
                        ...editingDestination,
                        highlights: editingDestination.highlights.split('\n').filter(h => h.trim() !== ''),
                        itinerary: itineraryDays.map(day => ({
                          day: day.day,
                          title: day.title,
                          activities: day.activities.filter(a => a.trim() !== '')
                        }))
                      };

                      const response = await fetch(`http://localhost:5000/api/trips/${editingDestination.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(updatedData)
                      });

                      if (!response.ok) {
                        throw new Error('Error updating destination');
                      }

                      await fetchDestinations();
                      setShowEditModal(false);
                      setEditingDestination(null);
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Error updating destination');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={editingDestination.title}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        title: e.target.value
                      })}
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Destination</label>
                    <input
                      type="text"
                      value={editingDestination.destination}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        destination: e.target.value
                      })}
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editingDestination.description}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        description: e.target.value
                      })}
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Price</label>
                    <input
                      type="number"
                      value={editingDestination.price}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        price: parseFloat(e.target.value)
                      })}
                      min="0"
                      step="0.01"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Duration (days)</label>
                    <input
                      type="number"
                      value={editingDestination.duration}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        duration: parseInt(e.target.value)
                      })}
                      min="1"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Rating</label>
                    <input
                      type="number"
                      value={editingDestination.rating}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        rating: parseFloat(e.target.value)
                      })}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="url"
                      value={editingDestination.image}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        image: e.target.value
                      })}
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Max Participants</label>
                    <input
                      type="number"
                      value={editingDestination.max_participants}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        max_participants: parseInt(e.target.value)
                      })}
                      min="1"
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Overview</label>
                    <textarea
                      value={editingDestination.overview}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        overview: e.target.value
                      })}
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">
                      Highlights (one per line)
                    </label>
                    <textarea
                      value={editingDestination.highlights}
                      onChange={(e) => setEditingDestination({
                        ...editingDestination,
                        highlights: e.target.value
                      })}
                      className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                      rows="4"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3a3a3c] text-sm font-medium mb-2">
                      Itinerary
                    </label>
                    <div className="space-y-4">
                      {itineraryDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-[#3a3a3c]">Day {day.day}</h4>
                            {itineraryDays.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newDays = itineraryDays.filter((_, i) => i !== dayIndex);
                                  setItineraryDays(newDays.map((d, i) => ({ ...d, day: i + 1 })));
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove Day
                              </button>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm mb-1 text-[#3a3a3c]">Day Title</label>
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => {
                                const newDays = [...itineraryDays];
                                newDays[dayIndex].title = e.target.value;
                                setItineraryDays(newDays);
                              }}
                              className="w-full border rounded p-2 text-[#3a3a3c]"
                              placeholder="Enter day title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm mb-1 text-[#3a3a3c]">Activities</label>
                            <div className="space-y-2">
                              {day.activities.map((activity, activityIndex) => (
                                <div key={activityIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={activity}
                                    onChange={(e) => {
                                      const newDays = [...itineraryDays];
                                      newDays[dayIndex].activities[activityIndex] = e.target.value;
                                      setItineraryDays(newDays);
                                    }}
                                    className="flex-1 border rounded p-2 text-[#3a3a3c]"
                                    placeholder={`Activity ${activityIndex + 1}`}
                                  />
                                  {day.activities.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newDays = [...itineraryDays];
                                        newDays[dayIndex].activities = day.activities.filter(
                                          (_, i) => i !== activityIndex
                                        );
                                        setItineraryDays(newDays);
                                      }}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                const newDays = [...itineraryDays];
                                newDays[dayIndex].activities.push('');
                                setItineraryDays(newDays);
                              }}
                              className="mt-2 text-[#4DA8DA] hover:text-[#3a8bb9]"
                            >
                              + Add Activity
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setItineraryDays([
                            ...itineraryDays,
                            {
                              day: itineraryDays.length + 1,
                              title: '',
                              activities: ['']
                            }
                          ]);
                        }}
                        className="w-full p-2 border border-dashed border-[#4DA8DA] text-[#4DA8DA] rounded-lg hover:bg-[#4DA8DA] hover:text-white transition-colors"
                      >
                        + Add Day
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="mt-4 flex justify-end gap-2 sticky bottom-0 bg-white pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDestination(null);
                  }}
                  className="px-4 py-2 text-[#3a3a3c] hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-destination-form"
                  className="px-4 py-2 bg-[#4DA8DA] text-white rounded hover:bg-[#3a8bb9]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationsView;