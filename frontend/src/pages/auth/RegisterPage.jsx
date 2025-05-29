import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/common/PageTransition';
import { FaUserCircle, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Registro exitoso! Por favor, inicia sesión.');
        navigate('/login');
      } else {
        alert(data.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-[#f6e7d7] flex flex-col items-center justify-center py-8 md:py-12 relative overflow-hidden">
          {/* Círculos decorativos */}
          <div className="absolute -top-16 md:-top-32 -left-16 md:-left-32 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-[#4DA8DA]/30 to-[#2980B9]/10 rounded-full blur-2xl z-0"></div>
          <div className="absolute -bottom-16 md:-bottom-32 -right-16 md:-right-32 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-tl from-[#4DA8DA]/20 to-[#2980B9]/5 rounded-full blur-2xl z-0"></div>
          <div className="w-full max-w-[90%] sm:max-w-md mx-auto bg-gradient-to-br from-white via-[#f0f8ff] to-[#e0f7fa] rounded-2xl shadow-2xl border-2 border-[#4DA8DA]/20 p-6 md:p-8 lg:p-10 z-10 relative">
            <div className="flex flex-col items-center mb-4 md:mb-6">
              <FaUserCircle className="text-[#4DA8DA] text-5xl md:text-6xl mb-2 drop-shadow" />
              <h1 className="text-2xl md:text-3xl font-extrabold text-center text-[#3a3a3c] mb-2">Crear una cuenta</h1>
              <p className="text-sm md:text-base text-gray-500 text-center mb-2">¡Únete a TravelDream y comienza a planear tu próxima aventura!</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4DA8DA] text-sm md:text-base" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full border rounded-lg p-2.5 md:p-3 pl-9 md:pl-10 text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
                  value={formData.name}
                  onChange={handleChange}
                  name="name"
                  required
                />
              </div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4DA8DA] text-sm md:text-base" />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="w-full border rounded-lg p-2.5 md:p-3 pl-9 md:pl-10 text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  required
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4DA8DA] text-sm md:text-base" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="w-full border rounded-lg p-2.5 md:p-3 pl-9 md:pl-10 text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  required
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4DA8DA] text-sm md:text-base" />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  className="w-full border rounded-lg p-2.5 md:p-3 pl-9 md:pl-10 text-sm md:text-base text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  name="confirmPassword"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 md:py-3 bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white text-base md:text-lg font-bold rounded-xl shadow-lg hover:scale-105 hover:from-[#2980B9] hover:to-[#4DA8DA] transition-all duration-200"
              >
                Registrarse
              </button>
            </form>
            <div className="mt-4 md:mt-6 text-center">
              <a href="/login" className="text-sm md:text-base text-[#4DA8DA] hover:underline font-medium transition">
                ¿Ya tienes cuenta? <span className="underline">Inicia sesión</span>
              </a>
            </div>
          </div>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
};

export default RegisterPage;