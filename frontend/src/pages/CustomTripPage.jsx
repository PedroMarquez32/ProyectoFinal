import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Añadir esta importación
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

  const popularDestinations = [
    'Santorini, Grecia', 
    'Bali, Indonesia', 
    'Tokio, Japón', 
    'Barcelona, España', 
    'Maldivas',
    'París, Francia'
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

  const validateForm = () => {
    if (!formData.destination) {
      alert('Por favor, selecciona un destino');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('Por favor, selecciona las fechas del viaje');
      return false;
    }
    if (formData.preferences.length === 0) {
      alert('Por favor, selecciona al menos una preferencia');
      return false;
    }
    if (!formData.accommodationType) {
      alert('Por favor, selecciona un tipo de alojamiento');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const customTripData = {
        destination: formData.destination,
        departure_date: formData.startDate,
        return_date: formData.endDate,
        number_of_participants: parseInt(formData.travelers),
        budget_per_person: parseFloat(formData.budget),
        interests: formData.preferences, // Asegúrate de que esto es un array
        accommodation_type: formData.accommodationType
      };

      console.log('Sending data:', customTripData); // Para debugging

      const response = await fetch('http://localhost:5000/api/custom-trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(customTripData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el viaje personalizado');
      }

      const data = await response.json();
      alert('¡Viaje personalizado creado con éxito!');
      navigate('/profile');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al crear el viaje personalizado');
    }
  };

  const renderSelectedPreferences = () => {
    return formData.preferences.map(prefId => {
      const pref = preferences.find(p => p.id === prefId);
      return pref ? pref.label : '';
    }).join(', ');
  };

  return (
    <div className="min-h-screen bg-[#f6e7d7]">
      <Navbar />
      
      <div className="bg-gradient-to-r from-[#40E0D0] to-[#2980B9] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Crea tu Viaje Soñado</h1>
          <p className="text-white opacity-90">
            Diseña un viaje personalizado que se adapte perfectamente a tus preferencias, presupuesto y calendario
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selección de Destino */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <span className="bg-[#4DA8DA] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">1</span>
                Elige tu Destino
              </h2>
              <p className="text-gray-900 mb-4">¿A dónde te gustaría ir?</p>
              <input
                type="text"
                placeholder="Buscar destinos o regiones..."
                className="w-full p-3 border rounded-lg mb-4 text-gray-900 placeholder-gray-500"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
              />
              <div className="flex flex-wrap gap-2">
                {popularDestinations.map((dest) => (
                  <button
                    key={dest}
                    className={`px-4 py-2 rounded-full border border-[#4DA8DA] transition-colors ${
                      formData.destination === dest 
                        ? 'bg-[#4DA8DA] text-white' 
                        : 'text-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                    }`}
                    onClick={() => setFormData({...formData, destination: dest})}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de Fechas */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <span className="bg-[#4DA8DA] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">2</span>
                Selecciona las Fechas
              </h2>
              <p className="text-gray-900 mb-4">¿Cuándo te gustaría viajar?</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 mb-2">Fecha de Inicio</label>
                  <input
                    type="date"
                    className="w-full p-3 border rounded-lg text-gray-900"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-gray-900 mb-2">Fecha de Fin</label>
                  <input
                    type="date"
                    className="w-full p-3 border rounded-lg text-gray-900"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Viajeros y Presupuesto */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <span className="bg-[#4DA8DA] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">3</span>
                Viajeros y Presupuesto
              </h2>
              <div className="mb-6">
                <p className="text-gray-900 mb-4">¿Cuántas personas viajarán?</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.travelers}
                    onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value)})}
                    className="w-20 p-2 border rounded-lg text-center text-gray-900"
                  />
                  <span className="text-gray-900">Adultos</span>
                </div>
              </div>
              <div>
                <p className="text-gray-900 mb-4">¿Cuál es tu presupuesto por persona?</p>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="100"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                  className="w-full accent-[#4DA8DA]"
                />
                <div className="flex justify-between text-sm text-gray-900 mt-2">
                  <span>1.000€</span>
                  <span>{formData.budget}€</span>
                  <span>10.000€</span>
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <span className="bg-[#4DA8DA] text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">4</span>
                Preferencias de Viaje
              </h2>
              <p className="text-gray-900 mb-4">¿Qué te interesa?</p>
              <div className="flex flex-wrap gap-3 mb-6">
                {preferences.map((pref) => (
                  <button
                    key={pref.id}
                    className={`px-4 py-2 rounded-full border border-[#4DA8DA] transition-colors ${
                      formData.preferences.includes(pref.id)
                        ? 'bg-[#4DA8DA] text-white'
                        : 'text-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                    }`}
                    onClick={() => {
                      const newPrefs = formData.preferences.includes(pref.id)
                        ? formData.preferences.filter(p => p !== pref.id)
                        : [...formData.preferences, pref.id];
                      setFormData({...formData, preferences: newPrefs});
                    }}
                  >
                    {pref.label}
                  </button>
                ))}
              </div>
              
              <p className="text-gray-900 mb-4">Tipo de alojamiento preferido</p>
              <div className="grid grid-cols-4 gap-4">
                {accommodationTypes.map((type) => (
                  <button
                    key={type}
                    className={`p-4 border border-[#4DA8DA] rounded-lg text-center transition-colors ${
                      formData.accommodationType === type
                        ? 'bg-[#4DA8DA] text-white'
                        : 'text-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                    }`}
                    onClick={() => setFormData({...formData, accommodationType: type})}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="w-full bg-[#4DA8DA] text-white py-3 rounded-lg hover:bg-[#3a8bb9] transition-colors"
              onClick={handleSubmit}
            >
              Crear mi Viaje
            </button>
          </div>

          {/* Resumen del Viaje */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4 shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 border-b pb-4">
                Resumen del Viaje
              </h3>
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-gray-500">Destino</span>
                  <span className="text-lg font-medium text-gray-900">
                    {formData.destination || 'Por seleccionar'}
                  </span>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-gray-500">Fechas</span>
                  <span className="text-lg font-medium text-gray-900">
                    {formData.startDate && formData.endDate 
                      ? `${new Date(formData.startDate).toLocaleDateString('es-ES')} - ${new Date(formData.endDate).toLocaleDateString('es-ES')}`
                      : 'Por seleccionar'}
                  </span>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-gray-500">Presupuesto por persona</span>
                  <span className="text-lg font-medium text-gray-900">
                    {formData.budget.toLocaleString('es-ES')}€
                  </span>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-gray-500">Número de viajeros</span>
                  <span className="text-lg font-medium text-gray-900">
                    {formData.travelers} {formData.travelers === 1 ? 'persona' : 'personas'}
                  </span>
                </div>

                {formData.preferences.length > 0 && (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-gray-500">Preferencias seleccionadas</span>
                    <span className="text-lg font-medium text-gray-900">
                      {renderSelectedPreferences()}
                    </span>
                  </div>
                )}

                {formData.accommodationType && (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-gray-500">Tipo de alojamiento</span>
                    <span className="text-lg font-medium text-gray-900">
                      {formData.accommodationType}
                    </span>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="text-lg font-medium text-gray-900">
                      {(formData.budget * formData.travelers).toLocaleString('es-ES')}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Tasas e impuestos (21%)</span>
                    <span className="text-lg font-medium text-gray-900">
                      {(formData.budget * formData.travelers * 0.21).toLocaleString('es-ES')}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg font-semibold text-gray-900">Presupuesto Total</span>
                    <span className="text-xl font-bold text-[#4DA8DA]">
                      {(formData.budget * formData.travelers * 1.21).toLocaleString('es-ES')}€
                    </span>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-blue-700">
                      * El precio final puede variar según las selecciones específicas y la disponibilidad
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomTripPage;