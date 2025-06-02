import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageTransition from '../../components/common/PageTransition';
import Spinner from '../../components/common/Spinner';

const DestinationsView = () => {
  const [state, setState] = useState({
    destinations: [], loading: true, error: null, editingDestination: null,
    showAddModal: false, showEditModal: false, user: null,
    itineraryDays: [{ day: 1, title: '', activities: [''] }]
  });

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, tripsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { credentials: 'include' }),
          fetch(`${import.meta.env.VITE_API_URL}/api/trips`, { credentials: 'include' })
        ]);
        const userData = await userRes.json();
        const tripsData = await tripsRes.json();
        updateState({ user: userData.user, destinations: tripsData, loading: false });
    } catch (error) {
        updateState({ error: error.message, loading: false });
      }
    };
    fetchData();
  }, []);

  const handleEdit = (destination) => {
    const formattedItinerary = destination.itinerary || [{ day: 1, title: '', activities: [''] }];
    updateState({
      itineraryDays: formattedItinerary,
      editingDestination: { ...destination, highlights: destination.highlights?.join('\n') || '' },
      showEditModal: true
    });
  };

  const handleSave = async (destination) => {
    try {
      const updatedData = {
        ...destination,
        highlights: destination.highlights.split('\n').filter(h => h.trim()),
        itinerary: typeof destination.itinerary === 'string' ? JSON.parse(destination.itinerary) : destination.itinerary
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${destination.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Error updating destination');
      const tripsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, { credentials: 'include' });
      updateState({ destinations: await tripsRes.json(), editingDestination: null, showEditModal: false });
    } catch (error) {
      alert('Error updating destination');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      if (!response.ok) throw new Error('Error deleting destination');
      const tripsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, { credentials: 'include' });
      updateState({ destinations: await tripsRes.json() });
      } catch (error) {
        alert('Error deleting destination');
    }
  };

  const renderTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Título', 'Destino', 'Precio', 'Valoración', 'Acciones'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {state.destinations.map(destination => (
              <tr key={destination.id}>
                <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">{destination.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">{destination.destination}</td>
                <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">{destination.price}€</td>
                <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">⭐ {destination.rating}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-x-2">
                    <button onClick={() => handleEdit(destination)} className="text-[#4DA8DA] hover:text-[#3a8bb9]">Editar</button>
                    <button onClick={() => handleDelete(destination.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderModal = (isEdit = false) => {
    const formData = isEdit ? state.editingDestination : {};
    const handleSubmit = async (e) => {
      e.preventDefault();
      const htmlForm = new FormData(e.target);
      const newDestination = {
        title: htmlForm.get('title'),
        destination: htmlForm.get('destination'),
        description: htmlForm.get('description'),
        price: parseFloat(htmlForm.get('price')),
        duration: parseInt(htmlForm.get('duration')),
        rating: parseFloat(htmlForm.get('rating')) || 0,
        image: htmlForm.get('image') || null,
        max_participants: parseInt(htmlForm.get('max_participants')) || 20,
        overview: htmlForm.get('overview'),
        highlights: htmlForm.get('highlights').split('\n').filter(h => h.trim()),
        itinerary: state.itineraryDays.map(day => ({
          day: day.day,
          title: day.title,
          activities: day.activities.filter(a => a.trim())
        })),
        is_active: true
      };

      try {
        const url = isEdit
          ? `${import.meta.env.VITE_API_URL}/api/trips/${state.editingDestination.id}`
          : `${import.meta.env.VITE_API_URL}/api/trips`;
        const response = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newDestination)
        });

        if (!response.ok) throw new Error('Error saving destination');
        const tripsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, { credentials: 'include' });
        updateState({
          destinations: await tripsRes.json(),
          showAddModal: false,
          showEditModal: false,
          editingDestination: null,
          itineraryDays: [{ day: 1, title: '', activities: [''] }]
        });
      } catch (error) {
        alert('Error saving destination');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4">
        <div className="bg-white p-8 rounded-lg w-full max-w-4xl my-8 relative">
          <div className="max-h-[80vh] overflow-y-auto pr-4">
            <h2 className="text-xl font-bold mb-4 text-[#3a3a3c] sticky top-0 bg-white py-2">
              {isEdit ? 'Edit Destination' : 'Add New Destination'}
            </h2>
            <form id={`${isEdit ? 'edit-' : ''}destination-form`} onSubmit={handleSubmit} className="space-y-4">
              {['title', 'destination', 'description', 'price', 'duration', 'rating', 'image', 'max_participants', 'overview'].map(field => (
                <div key={field}>
                  <label className="block text-[#3a3a3c] text-sm font-medium mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {field === 'description' || field === 'overview' ? (
                    isEdit ? (
                      <textarea
                        name={field}
                        value={formData[field] || ''}
                        onChange={e => updateState({
                          editingDestination: { ...state.editingDestination, [field]: e.target.value }
                        })}
                        className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                        rows={field === 'overview' ? 4 : 3}
                        required
                      />
                    ) : (
                      <textarea
                        name={field}
                        className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                        rows={field === 'overview' ? 4 : 3}
                        required
                      />
                    )
                  ) : (
                    isEdit ? (
                      <input
                        type={field === 'price' || field === 'rating' || field === 'duration' || field === 'max_participants' ? 'number' : 'text'}
                        name={field}
                        value={formData[field] || ''}
                        onChange={e => updateState({
                          editingDestination: { ...state.editingDestination, [field]: e.target.value }
                        })}
                        className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                        required={field !== 'image'}
                        min={field === 'rating' ? 0 : field === 'duration' || field === 'max_participants' ? 1 : undefined}
                        max={field === 'rating' ? 5 : undefined}
                        step={field === 'rating' ? 0.1 : undefined}
                      />
                    ) : (
                      <input
                        type={field === 'price' || field === 'rating' || field === 'duration' || field === 'max_participants' ? 'number' : 'text'}
                        name={field}
                        className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                        required={field !== 'image'}
                        min={field === 'rating' ? 0 : field === 'duration' || field === 'max_participants' ? 1 : undefined}
                        max={field === 'rating' ? 5 : undefined}
                        step={field === 'rating' ? 0.1 : undefined}
                      />
                    )
                  )}
                </div>
              ))}
              <div>
                <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Highlights (one per line)</label>
                {isEdit ? (
                  <textarea
                    name="highlights"
                    value={formData.highlights || ''}
                    onChange={e => updateState({
                      editingDestination: { ...state.editingDestination, highlights: e.target.value }
                    })}
                    className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    rows="4"
                    required
                  />
                ) : (
                  <textarea
                    name="highlights"
                    className="w-full border rounded-lg p-2 text-[#3a3a3c]"
                    rows="4"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-[#3a3a3c] text-sm font-medium mb-2">Itinerary</label>
                <div className="space-y-4">
                  {state.itineraryDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-[#3a3a3c]">Day {day.day}</h4>
                        {state.itineraryDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newDays = state.itineraryDays.filter((_, i) => i !== dayIndex);
                              updateState({
                                itineraryDays: newDays.map((d, i) => ({ ...d, day: i + 1 }))
                              });
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
                          onChange={e => {
                            const newDays = [...state.itineraryDays];
                            newDays[dayIndex].title = e.target.value;
                            updateState({ itineraryDays: newDays });
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
                                onChange={e => {
                                  const newDays = [...state.itineraryDays];
                                  newDays[dayIndex].activities[activityIndex] = e.target.value;
                                  updateState({ itineraryDays: newDays });
                                }}
                                className="flex-1 border rounded p-2 text-[#3a3a3c]"
                                placeholder={`Activity ${activityIndex + 1}`}
                              />
                              {day.activities.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDays = [...state.itineraryDays];
                                    newDays[dayIndex].activities = day.activities.filter((_, i) => i !== activityIndex);
                                    updateState({ itineraryDays: newDays });
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
                            const newDays = [...state.itineraryDays];
                            newDays[dayIndex].activities.push('');
                            updateState({ itineraryDays: newDays });
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
                      updateState({
                        itineraryDays: [
                          ...state.itineraryDays,
                          { day: state.itineraryDays.length + 1, title: '', activities: [''] }
                        ]
                      });
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
            {isEdit && (
              <button
                onClick={() => handleDelete(state.editingDestination.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar Reserva
              </button>
            )}
            <button
              type="button"
              onClick={() => updateState({ [isEdit ? 'showEditModal' : 'showAddModal']: false })}
              className="px-4 py-2 bg-[#1a1a1a] text-white rounded-md hover:bg-gray-800 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form={`${isEdit ? 'edit-' : ''}destination-form`}
              className="px-4 py-2 bg-[#4DA8DA] text-white rounded hover:bg-[#3a8bb9]"
            >
              {isEdit ? 'Guardar Cambios' : 'Añadir Destino'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (state.loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={state.user} />
        <div className="flex-1 flex items-center justify-center">
          <Spinner fullScreen />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={state.user} />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto h-full">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-[#3a3a3c]">Gestión de Destinos</h1>
                                  <button
                onClick={() => updateState({ showAddModal: true })}
                className="bg-[#4DA8DA] text-white px-4 py-2 rounded-lg hover:bg-[#3a8bb9]"
              >
                Añadir Destino
                                  </button>
                              </div>
                              
            {state.error ? <div className="text-center py-4 text-red-600">{state.error}</div> :
             renderTable()}

            {state.showAddModal && renderModal()}
            {state.showEditModal && renderModal(true)}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DestinationsView;