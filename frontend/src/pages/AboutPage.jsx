import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { FaHandshake, FaGlobeAmericas, FaStar, FaCheckCircle } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-[#f6e7d7] py-6 md:py-8 lg:py-12 flex flex-col items-center">
          <div className="max-w-4xl w-[90%] mx-auto bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-2xl border-2 border-[#4DA8DA]/20 p-4 md:p-6 lg:p-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center text-[#3a3a3c] mb-6 md:mb-8 lg:mb-10">
              Sobre Nosotros
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 mb-6 md:mb-8 lg:mb-10">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[#4DA8DA]">Nuestra Historia</h2>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 md:mb-4">
                  TravelDream nació en 2020 con una visión clara: revolucionar la forma en que las personas planifican y disfrutan sus viajes. Fundada por un grupo de apasionados viajeros españoles, nuestra agencia se ha convertido en un referente en el sector turístico nacional.
                </p>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  Con sede en Madrid y presencia en las principales ciudades españolas, nos enorgullece haber ayudado a miles de viajeros a crear recuerdos inolvidables en los destinos más fascinantes del mundo.
                </p>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[#4DA8DA]">¿Por Qué Elegirnos?</h2>
                <ul className="space-y-2 md:space-y-3">
                  <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                    <FaCheckCircle className="text-[#4DA8DA] flex-shrink-0" />
                    <span>Experiencias de viaje personalizadas</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                    <FaCheckCircle className="text-[#4DA8DA] flex-shrink-0" />
                    <span>Atención al cliente 24/7</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                    <FaCheckCircle className="text-[#4DA8DA] flex-shrink-0" />
                    <span>Garantía de mejor precio</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                    <FaCheckCircle className="text-[#4DA8DA] flex-shrink-0" />
                    <span>Destinos cuidadosamente seleccionados</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6 md:my-8 lg:my-10"></div>

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-[#3a3a3c]">Nuestros Valores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8 lg:mb-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#4DA8DA] rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-lg">
                  <FaStar className="text-white text-2xl md:text-3xl" />
                </div>
                <h3 className="font-semibold mb-2 text-[#3a3a3c] text-base md:text-lg">Excelencia</h3>
                <p className="text-sm md:text-base text-gray-600 text-center">Comprometidos con ofrecer el mejor servicio posible</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#4DA8DA] rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-lg">
                  <FaHandshake className="text-white text-2xl md:text-3xl" />
                </div>
                <h3 className="font-semibold mb-2 text-[#3a3a3c] text-base md:text-lg">Confianza</h3>
                <p className="text-sm md:text-base text-gray-600 text-center">Construyendo relaciones duraderas con nuestros clientes</p>
              </div>
              <div className="flex flex-col items-center sm:col-span-2 md:col-span-1">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#4DA8DA] rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-lg">
                  <FaGlobeAmericas className="text-white text-2xl md:text-3xl" />
                </div>
                <h3 className="font-semibold mb-2 text-[#3a3a3c] text-base md:text-lg">Sostenibilidad</h3>
                <p className="text-sm md:text-base text-gray-600 text-center">Comprometidos con el turismo responsable</p>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6 md:my-8 lg:my-10"></div>

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-[#3a3a3c]">Nuestros Números</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 text-center">
              <div>
                <div className="text-[#4DA8DA] text-2xl md:text-3xl font-bold mb-1 md:mb-2">+5000</div>
                <p className="text-sm md:text-base text-gray-600">Viajeros Satisfechos</p>
              </div>
              <div>
                <div className="text-[#4DA8DA] text-2xl md:text-3xl font-bold mb-1 md:mb-2">+50</div>
                <p className="text-sm md:text-base text-gray-600">Destinos</p>
              </div>
              <div>
                <div className="text-[#4DA8DA] text-2xl md:text-3xl font-bold mb-1 md:mb-2">98%</div>
                <p className="text-sm md:text-base text-gray-600">Satisfacción</p>
              </div>
              <div>
                <div className="text-[#4DA8DA] text-2xl md:text-3xl font-bold mb-1 md:mb-2">24/7</div>
                <p className="text-sm md:text-base text-gray-600">Soporte</p>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
};

export default AboutPage; 