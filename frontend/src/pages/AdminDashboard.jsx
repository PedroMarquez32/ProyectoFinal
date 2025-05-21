import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last 30 days');
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
  const location = useLocation();

  useEffect(() => {
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
              <Link 
                to="/admin" 
                className={`flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors ${
                  location.pathname === '/admin' ? 'bg-[#4DA8DA]' : ''
                }`}
              >
                <span className="material-icons">dashboard</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className={`flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors ${
                  location.pathname === '/admin/users' ? 'bg-[#4DA8DA]' : ''
                }`}
              >
                <span className="material-icons">people</span>
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/destinations" 
                className={`flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors ${
                  location.pathname === '/admin/destinations' ? 'bg-[#4DA8DA]' : ''
                }`}
              >
                <span className="material-icons">place</span>
                <span>Destinations</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/bookings" className="flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">book</span>
                <span>Bookings</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/finances" className="flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">attach_money</span>
                <span>Finances</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/reviews" className="flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">star</span>
                <span>Reviews</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 p-4 w-64 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4DA8DA] rounded-full flex items-center justify-center text-white">
              {user?.username ? user.username[0].toUpperCase() : 'A'}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user?.username || 'Loading...'}</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="text-black">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search..."
                className="px-4 py-2 border rounded-lg"
              />
              <button className="p-2 rounded-full bg-gray-100">
                <span className="material-icons">notifications</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {Object.entries(dashboardData.stats).map(([key, value]) => (
              <div key={key} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">{key}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bookings Overview & Popular Destinations */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Bookings Overview Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Bookings Overview</h3>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                </select>
              </div>
              {/* Chart placeholder */}
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                Bookings Chart
              </div>
            </div>

            {/* Popular Destinations */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-6">Popular Destinations</h3>
              <div className="space-y-4">
                {dashboardData.popularDestinations.map((destination) => (
                  <div key={destination.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{destination.destination}</h4>
                      <p className="text-sm text-gray-500">{destination.bookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{destination.revenue}</p>
                      <p className="text-sm text-gray-500">⭐ {destination.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">Recent Activity</h3>
              <button className="text-[#4DA8DA]">View all</button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-100' :
                    activity.type === 'booking' ? 'bg-green-100' :
                    activity.type === 'review' ? 'bg-yellow-100' : 'bg-purple-100'
                  }`}>
                    <span className="material-icons text-lg">
                      {activity.type === 'user' ? 'person' :
                       activity.type === 'booking' ? 'confirmation_number' :
                       activity.type === 'review' ? 'star' : 'notifications'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;