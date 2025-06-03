import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/common/PageTransition';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaEuroSign, FaStar } from 'react-icons/fa';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-toastify';

const popularDestinations = [
  'Santorini, Grecia', 'Bali, Indonesia', 'Tokio, Japón', 'Barcelona, España',
  'Maldivas', 'París, Francia', 'Nueva York, EE.UU.', 'Roma, Italia',
  'Londres, Reino Unido', 'Dubái, EAU', 'Bangkok, Tailandia', 'Sydney, Australia'
];

const preferences = [
  { id: 'cultural', label: 'Experiencias Culturales' },
  { id: 'adventure', label: 'Aventura y Aire Libre' },
  { id: 'scenic', label: 'Paisajes y Costa' },
  { id: 'wellness', label: 'Bienestar y Spa' },
  { id: 'nightlife', label: 'Vida Nocturna' },
  { id: 'shopping', label: 'Compras' },
  { id: 'family', label: 'Para Familias' }
];

const accommodationTypes = ['Hotel', 'Resort', 'Villa', 'Apartamento'];

const CustomTripPage = () => {
  const navigate = useNavigate(); // Añadir esta línea
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: 5000,
    preferences: [],
    accommodationType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!formData.destination) {
      toast.error('Por favor, selecciona un destino');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Por favor, selecciona las fechas del viaje');
      return false;
    }
    if (formData.preferences.length === 0) {
      toast.error('Por favor, selecciona al menos una preferencia');
      return false;
    }
    if (!formData.accommodationType) {
      toast.error('Por favor, selecciona un tipo de alojamiento');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const customTripData = {
      destination: formData.destination.trim(),
      departure_date: formData.startDate,
      return_date: formData.endDate,
      number_of_participants: Number(formData.travelers),
      budget_per_person: Number(formData.budget),
      interests: formData.preferences,
      accommodation_type: formData.accommodationType
    };

    console.log('Enviando customTripData:', customTripData);

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/custom-trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(customTripData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el viaje personalizado');
      }

      toast.success('¡Viaje personalizado creado con éxito!');
      alert('¡Viaje personalizado creado con éxito!');
      navigate('/profile');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al crear el viaje personalizado');
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedPreferences = () => {
    return formData.preferences.map(prefId => {
      const pref = preferences.find(p => p.id === prefId);
      return pref ? pref.label : '';
    }).join(', ');
  };

  const togglePreference = (id) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(id)
        ? prev.preferences.filter((p) => p !== id)
        : [...prev.preferences, id]
    }));
  };

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#f6e7d7] to-[#e0f7fa] py-6 md:py-8 lg:py-10">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            {/* Formulario principal */}
            <form className="flex-1 space-y-4 md:space-y-6 lg:space-y-8" onSubmit={handleSubmit}>
              {/* Paso 1 */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8 flex flex-col gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <FaMapMarkerAlt className="text-[#4DA8DA] text-xl md:text-2xl" />
                  <h2 className="text-lg md:text-xl font-bold text-[#3a3a3c]">1. Elige tu Destino</h2>
                </div>
                <input
                  type="text"
                  placeholder="Buscar destinos o regiones..."
                  className="w-full border rounded-lg p-2 md:p-3 text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                />
                <div className="flex flex-wrap gap-2 md:gap-3 mt-1 md:mt-2">
                  {popularDestinations.map((dest) => (
                    <button
                      key={dest}
                      className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold shadow transition-all duration-200 border-2 ${
                        formData.destination === dest
                          ? 'bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white border-[#4DA8DA] scale-105'
                          : 'bg-white text-[#4DA8DA] border-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                      }`}
                      onClick={() => setFormData({ ...formData, destination: dest })}
                      type="button"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paso 2 */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8 flex flex-col gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <FaCalendarAlt className="text-[#4DA8DA] text-xl md:text-2xl" />
                  <h2 className="text-lg md:text-xl font-bold text-[#3a3a3c]">2. Selecciona las Fechas</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <div className="flex-1">
                    <label className="block text-sm md:text-base text-gray-700 mb-1">Fecha de Inicio</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg p-2 md:p-3 text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm md:text-base text-gray-700 mb-1">Fecha de Fin</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg p-2 md:p-3 text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8 flex flex-col gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <FaUsers className="text-[#4DA8DA] text-xl md:text-2xl" />
                  <h2 className="text-lg md:text-xl font-bold text-[#3a3a3c]">3. Viajeros y Presupuesto</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
                  <label className="block text-sm md:text-base text-gray-700">¿Cuántas personas viajarán?</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      className="w-16 md:w-20 border rounded-lg p-2 text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
                      value={formData.travelers}
                      onChange={e => setFormData({ ...formData, travelers: Number(e.target.value) })}
                    />
                    <span className="text-sm md:text-base text-gray-700">Adultos</span>
                  </div>
                </div>
                {/* Presupuesto slider */}
                <div className="w-full flex flex-col gap-2">
                  <label className="font-medium text-sm md:text-base text-gray-700 mb-1">¿Cuál es tu presupuesto por persona?</label>
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={1000}
                      max={10000}
                      step={100}
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                      className="w-full accent-[#4DA8DA] h-2 rounded-lg bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] appearance-none"
                      style={{
                        background: `linear-gradient(90deg, #4DA8DA ${(formData.budget-1000)/90}%, #e0e7ef ${(formData.budget-1000)/90}%)`
                      }}
                    />
                    <span className="absolute right-0 -top-6 md:-top-7 bg-[#4DA8DA] text-white px-2 md:px-3 py-1 rounded-lg shadow text-xs md:text-sm font-bold">
                      {formData.budget.toLocaleString('es-ES')}€
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1.000€</span>
                    <span>10.000€</span>
                  </div>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8 flex flex-col gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <FaStar className="text-[#4DA8DA] text-xl md:text-2xl" />
                  <h2 className="text-lg md:text-xl font-bold text-[#3a3a3c]">4. Preferencias de Viaje</h2>
                </div>
                <label className="block text-sm md:text-base text-gray-700 mb-1">¿Qué te interesa?</label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {preferences.map((pref) => (
                    <button
                      key={pref.id}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold border-2 shadow transition-all duration-200 ${
                        formData.preferences.includes(pref.id)
                          ? 'bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white border-[#4DA8DA] scale-105'
                          : 'bg-white text-[#4DA8DA] border-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                      }`}
                      onClick={() => togglePreference(pref.id)}
                      type="button"
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
                <label className="block text-sm md:text-base text-gray-700 mt-3 md:mt-4 mb-1">Tipo de alojamiento preferido</label>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {accommodationTypes.map(type => (
                    <button
                      key={type}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold border-2 shadow transition-all duration-200 ${
                        formData.accommodationType === type
                          ? 'bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white border-[#4DA8DA] scale-105'
                          : 'bg-white text-[#4DA8DA] border-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                      }`}
                      onClick={() => setFormData({ ...formData, accommodationType: type })}
                      type="button"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="w-full py-2.5 md:py-3 bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white text-base md:text-lg font-bold rounded-xl shadow-lg hover:scale-105 hover:from-[#2980B9] hover:to-[#4DA8DA] transition-all duration-200"
              >
                Crear Viaje Personalizado
              </button>
            </form>
            {/* Tabla resumen */}
            <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-4 flex flex-col">
              <h3 className="text-xl font-bold mb-4 text-[#3a3a3c] flex items-center gap-2">
                <span className="text-[#4DA8DA]">📝</span> Resumen del Viaje
              </h3>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="text-[#4DA8DA] text-lg">📍</span>
                  <span className="font-medium text-gray-900">Destino:</span>
                  <span className="ml-auto text-gray-900">{formData.destination || <span className="text-gray-400">Sin seleccionar</span>}</span>
                </div>
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="text-[#4DA8DA] text-lg">📅</span>
                  <span className="font-medium text-gray-900">Fechas:</span>
                  <span className="ml-auto text-gray-900">
                    {formData.startDate || <span className="text-gray-400">-</span>} &rarr; {formData.endDate || <span className="text-gray-400">-</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="text-[#4DA8DA] text-lg">👥</span>
                  <span className="font-medium text-gray-900">Viajeros:</span>
                  <span className="ml-auto text-gray-900">{formData.travelers}</span>
                </div>
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="text-[#4DA8DA] text-lg">💶</span>
                  <span className="font-medium text-gray-900">Presupuesto:</span>
                  <span className="ml-auto text-gray-900">{formData.budget} €</span>
                </div>
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="text-[#4DA8DA] text-lg">⭐</span>
                  <span className="font-medium text-gray-900">Preferencias:</span>
                  <span className="ml-auto text-gray-900">
                    {formData.preferences.length > 0
                      ? formData.preferences.map(id => preferences.find(p => p.id === id)?.label).join(', ')
                      : <span className="text-gray-400">Ninguna</span>
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4DA8DA] text-lg">🏨</span>
                  <span className="font-medium text-gray-900">Alojamiento:</span>
                  <span className="ml-auto text-gray-900">{formData.accommodationType || <span className="text-gray-400">Sin seleccionar</span>}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
};

export default CustomTripPage;