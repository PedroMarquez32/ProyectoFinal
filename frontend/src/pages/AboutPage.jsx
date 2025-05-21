import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#f6e7d7]">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#3a3a3c] text-center mb-8">Sobre Nosotros</h1>
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-[#3a3a3c]">Nuestra Historia</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  TravelDream nació en 2020 con una visión clara: revolucionar la forma en que las personas planifican y disfrutan sus viajes. Fundada por un grupo de apasionados viajeros españoles, nuestra agencia se ha convertido en un referente en el sector turístico nacional.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Con sede en Madrid y presencia en las principales ciudades españolas, nos enorgullece haber ayudado a miles de viajeros a crear recuerdos inolvidables en los destinos más fascinantes del mundo.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-[#3a3a3c]">¿Por Qué Elegirnos?</h2>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="text-[#4DA8DA]">✓</span>
                    <span className="text-gray-700">Experiencias de viaje personalizadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[#4DA8DA]">✓</span>
                    <span className="text-gray-700">Atención al cliente 24/7</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[#4DA8DA]">✓</span>
                    <span className="text-gray-700">Garantía de mejor precio</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[#4DA8DA]">✓</span>
                    <span className="text-gray-700">Destinos cuidadosamente seleccionados</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-[#3a3a3c] text-center">Nuestros Valores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#4DA8DA] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🌟</span>
                  </div>
                  <h3 className="font-semibold mb-2">Excelencia</h3>
                  <p className="text-gray-600">Comprometidos con ofrecer el mejor servicio posible</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#4DA8DA] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🤝</span>
                  </div>
                  <h3 className="font-semibold mb-2">Confianza</h3>
                  <p className="text-gray-600">Construyendo relaciones duraderas con nuestros clientes</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#4DA8DA] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🌍</span>
                  </div>
                  <h3 className="font-semibold mb-2">Sostenibilidad</h3>
                  <p className="text-gray-600">Comprometidos con el turismo responsable</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-[#3a3a3c] text-center">Nuestros Números</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-[#4DA8DA] text-3xl font-bold mb-2">+5000</div>
                  <p className="text-gray-600">Viajeros Satisfechos</p>
                </div>
                <div className="text-center">
                  <div className="text-[#4DA8DA] text-3xl font-bold mb-2">+50</div>
                  <p className="text-gray-600">Destinos</p>
                </div>
                <div className="text-center">
                  <div className="text-[#4DA8DA] text-3xl font-bold mb-2">98%</div>
                  <p className="text-gray-600">Satisfacción</p>
                </div>
                <div className="text-center">
                  <div className="text-[#4DA8DA] text-3xl font-bold mb-2">24/7</div>
                  <p className="text-gray-600">Soporte</p>
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

export default AboutPage; 