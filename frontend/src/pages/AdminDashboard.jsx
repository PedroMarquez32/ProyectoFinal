import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import AdminSidebar from '../components/AdminSidebar';
import { motion } from 'framer-motion';  
import PageTransition from '../components/PageTransition';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 4,
    activeBookings: 4,
    activeDestinations: 6 
  });
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      activeBookings: 0,
      monthlyRevenue: 0
    },
    popularDestinations: [],
    recentActivity: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchDashboardData();
    fetchUserData();
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

  const fetchDashboardData = async () => {
    try {
      const [usersResponse, bookingsResponse, tripsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/users/count', { credentials: 'include' }),
        fetch('http://localhost:5000/api/bookings/stats', { credentials: 'include' }),
        fetch('http://localhost:5000/api/trips/stats/popular', { credentials: 'include' })
      ]);

      if (!usersResponse.ok) throw new Error('Error fetching users count');
      if (!bookingsResponse.ok) throw new Error('Error fetching bookings stats');
      if (!tripsResponse.ok) throw new Error('Error fetching popular trips');

      const [usersData, bookingsData, tripsData] = await Promise.all([
        usersResponse.json(),
        bookingsResponse.json(),
        tripsResponse.json()
      ]);

      setDashboardData({
        stats: {
          totalUsers: usersData.count || 0,
          activeBookings: bookingsData.activeCount || 0,
          monthlyRevenue: bookingsData.monthlyRevenue || 0
        },
        popularDestinations: tripsData || [],
        recentActivity: bookingsData.recentActivity || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        stats: { totalUsers: 0, activeBookings: 0, monthlyRevenue: 0 },
        popularDestinations: [],
        recentActivity: []
      });
    }
  };

  // Modificar fetchStats para que funcione correctamente
  const fetchStats = async () => {
    try {
      const [usersResponse, bookingsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/users/count', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/bookings/count', { // Cambiado de stats a count
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        })
      ]);

      if (!usersResponse.ok || !bookingsResponse.ok) {
        throw new Error('Error fetching stats');
      }

      const usersData = await usersResponse.json();
      const bookingsData = await bookingsResponse.json();

      setStats(prevStats => ({
        ...prevStats,
        totalUsers: usersData.count || 0,
        activeBookings: bookingsData.count || 0
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Datos para la gráfica de líneas de reservas
  const bookingsChartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Reservas',
        data: [65, 59, 80, 81, 56, 90],
        fill: false,
        borderColor: '#4DA8DA',
        tension: 0.4,
      },
    ],
  };

  const bookingsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Reservas Mensuales'
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Datos para la gráfica circular de destinos populares
  const popularDestinationsChartData = {
    labels: ['Tokio', 'París', 'Barcelona', 'Nueva York', 'Roma'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          '#4DA8DA',
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Modificar las opciones de la gráfica circular para hacerla más grande
  const popularDestinationsChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Esto permite que la gráfica se ajuste al contenedor
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14 // Tamaño de fuente más grande para las etiquetas
          }
        }
      },
      title: {
        display: true,
        text: 'Destinos Más Populares (%)',
        font: {
          size: 18 // Título más grande
        }
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <PageTransition>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={user} />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto h-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
              <p className="text-sm lg:text-base text-gray-600">¡Bienvenido de nuevo! Esto es lo que está pasando hoy.</p>
            </div>

            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: "Usuarios Totales", value: stats.totalUsers },
                { label: "Reservas Activas", value: stats.activeBookings },
                { label: "Destinos Activos", value: stats.activeDestinations }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-3 lg:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  variants={itemVariants}
                >
                  <p className="text-gray-500 text-sm lg:text-base font-medium">{stat.label}</p>
                  <h3 className="text-xl lg:text-2xl font-bold mt-1 text-gray-800">{stat.value}</h3>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              {/* Monthly Bookings Chart */}
              <motion.div 
                className="bg-white p-3 lg:p-4 rounded-lg shadow-sm"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4 text-gray-800">Reservas Mensuales</h3>
                <div className="h-[250px] lg:h-[350px] w-full">
                  <Line 
                    data={bookingsChartData} 
                    options={{
                      ...bookingsChartOptions,
                      maintainAspectRatio: false,
                      responsive: true
                    }} 
                  />
                </div>
              </motion.div>

              {/* Popular Destinations Chart */}
              <motion.div 
                className="bg-white p-3 lg:p-4 rounded-lg shadow-sm"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4 text-gray-800">Destinos Populares</h3>
                <div className="h-[250px] lg:h-[350px] w-full">
                  <Pie 
                    data={popularDestinationsChartData} 
                    options={{
                      ...popularDestinationsChartOptions,
                      maintainAspectRatio: false,
                      responsive: true
                    }} 
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;