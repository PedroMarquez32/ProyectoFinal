import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import { motion } from 'framer-motion';  
import PageTransition from '../../../components/common/PageTransition';
import { format } from 'date-fns';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);
  const [activeDestinations, setActiveDestinations] = useState(0);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      activeBookings: 0,
      monthlyRevenue: 0
    },
    popularDestinations: [],
    recentActivity: []
  });
  const [bookingStatusCounts, setBookingStatusCounts] = useState({});
  const [bookingsPerMonth, setBookingsPerMonth] = useState({});
  const [accommodationCounts, setAccommodationCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchDashboardStats();
    fetchBookingStatusCounts();
    fetchBookingsPerMonth();
    fetchAccommodationCounts();
    fetchTripsAndBookings();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
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

  const fetchDashboardStats = async () => {
    // Usuarios totales
    const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, { credentials: 'include' });
    const users = await usersRes.json();
    setTotalUsers(users.length);

    // Reservas activas
    const bookingsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/stats`, { credentials: 'include' });
    const bookingsStats = await bookingsRes.json();
    setActiveBookings(bookingsStats.activeCount);

    // Destinos activos
    const tripsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, { credentials: 'include' });
    const trips = await tripsRes.json();
    setActiveDestinations(trips.filter(t => t.is_active).length);
  };

  const fetchTripsAndBookings = async () => {
    // Fetch trips
    const tripsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, { credentials: 'include' });
    const tripsData = await tripsRes.json();
    setTrips(tripsData);

    // Fetch bookings
    const bookingsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, { credentials: 'include' });
    const bookingsData = await bookingsRes.json();
    setBookings(bookingsData);

    // Calcular destinos populares
    const destinationCounts = {};
    bookingsData.forEach(b => {
      const trip = tripsData.find(t => t.id === b.trip_id);
      if (trip) {
        destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1;
      }
    });
    // Convertir a array y ordenar por número de reservas
    const popular = Object.entries(destinationCounts)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count);
    setPopularDestinations(popular);
  };

  const fetchBookingStatusCounts = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, { credentials: 'include' });
    const bookings = await res.json();
    const counts = { PENDING: 0, CONFIRMED: 0, CANCELLED: 0 };
    bookings.forEach(b => {
      if (counts[b.status]) counts[b.status]++;
      else counts[b.status] = 1;
    });
    setBookingStatusCounts(counts);
  };

  const fetchBookingsPerMonth = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, { credentials: 'include' });
    const bookings = await res.json();
    const counts = {};
    bookings.forEach(b => {
      const month = format(new Date(b.created_at), 'yyyy-MM');
      counts[month] = (counts[month] || 0) + 1;
    });
    setBookingsPerMonth(counts);
  };

  const fetchAccommodationCounts = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/custom-trips`, { credentials: 'include' });
    const trips = await res.json();
    const counts = {};
    trips.forEach(t => {
      counts[t.accommodation_type] = (counts[t.accommodation_type] || 0) + 1;
    });
    setAccommodationCounts(counts);
  };

  const fetchDashboardData = async () => {
    try {
      const [usersResponse, bookingsResponse, tripsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/users/count`, { credentials: 'include' }),
        fetch(`${import.meta.env.VITE_API_URL}/api/bookings/stats`, { credentials: 'include' }),
        fetch(`${import.meta.env.VITE_API_URL}/api/trips/stats/popular`, { credentials: 'include' })
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

  // --- DATOS REALES PARA GRÁFICAS ---
  // 1. Gráfica de barras y pastel de reservas por destino (solo datos reales)
  const barColors = [
    '#4DA8DA', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFD166', '#B388FF', '#FF8C94'
  ];
  const destinosLabels = popularDestinations.map(d => d.destination);
  const destinosCounts = popularDestinations.map(d => d.count);

  const barChartData = {
    labels: destinosLabels,
    datasets: [
      {
        label: 'Reservas',
        data: destinosCounts,
        backgroundColor: destinosLabels.map((_, i) => barColors[i % barColors.length]),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const pieChartData = {
    labels: destinosLabels,
    datasets: [
      {
        data: destinosCounts,
        backgroundColor: barColors,
        borderWidth: 2,
      },
    ],
  };

  // 2. Gráfica de barras de estados de reserva
  const statusBarData = {
    labels: Object.keys(bookingStatusCounts),
    datasets: [
      {
        label: 'Reservas',
        data: Object.values(bookingStatusCounts),
        backgroundColor: ['#FFD166', '#06D6A0', '#EF476F'],
        borderRadius: 8,
      },
    ],
  };

  // 3. Gráfica de pastel de tipos de alojamiento en viajes personalizados
  const accommodationLabels = Object.keys(accommodationCounts);
  const accommodationPieData = {
    labels: accommodationLabels,
    datasets: [
      {
        data: accommodationLabels.map(l => accommodationCounts[l]),
        backgroundColor: ['#4DA8DA', '#FF6B6B', '#FFD166', '#06D6A0'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <PageTransition>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={user} />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto h-full">
            {/* Cards de stats */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
              <p className="text-sm lg:text-base text-gray-600">¡Bienvenido de nuevo! Esto es lo que está pasando hoy.</p>
            </div>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: "Usuarios Totales", value: totalUsers },
                { label: "Reservas Activas", value: activeBookings },
                { label: "Destinos Activos", value: activeDestinations }
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

            {/* Primera fila de gráficas: Barras y Pastel de destinos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-6">
              <motion.div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm" variants={itemVariants}>
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4 text-gray-800">Reservas por Destino</h3>
                <div className="h-[250px] lg:h-[350px] w-full">
                  <Bar data={barChartData} options={{
                    responsive: true,
                    plugins: { legend: { display: false }, title: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                  }} />
                </div>
              </motion.div>
              <motion.div 
                className="bg-white p-3 lg:p-4 rounded-lg shadow-sm"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4 text-gray-800">Destinos Más Populares (%)</h3>
                <div className="h-[250px] lg:h-[350px] w-full flex items-center justify-center">
                  <Pie 
                    data={pieChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' },
                        title: { display: false }
                      }
                    }} 
                  />
                </div>
              </motion.div>
            </div>

            {/* Segunda fila de gráficas: Barras de estado y pastel de alojamiento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <motion.div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm" variants={itemVariants}>
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4 text-gray-800">Reservas por Estado</h3>
                <div className="h-[250px] lg:h-[350px] w-full">
                  <Bar data={statusBarData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
              </motion.div>
              <motion.div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm" variants={itemVariants}>
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4 text-gray-800">Tipos de Alojamiento (Viajes Personalizados)</h3>
                <div className="h-[250px] lg:h-[350px] w-full flex items-center justify-center">
                  <Pie data={accommodationPieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
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