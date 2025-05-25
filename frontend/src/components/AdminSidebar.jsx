import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'people', label: 'Users' },
    { path: '/admin/destinations', icon: 'place', label: 'Destinations' },
    { path: '/admin/bookings', icon: 'book', label: 'Bookings' },
    { path: '/admin/finances', icon: 'attach_money', label: 'Finances' },
    { path: '/admin/reviews', icon: 'star', label: 'Reviews' },
  ];

  return (
    <div className="w-64 bg-[#3a3a3c] min-h-screen fixed left-0">
      <Link to="/" className="block">
        <div className="p-4 border-b border-gray-700 hover:bg-[#4a4a4c] transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xl">TravelDream</span>
          </div>
          <div className="text-sm text-gray-400">Admin Dashboard</div>
        </div>
      </Link>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={`flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors ${
                  location.pathname === item.path ? 'bg-[#4DA8DA]' : ''
                }`}
              >
                <span className="material-icons">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {user && (
        <div className="absolute bottom-0 p-4 w-64 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4DA8DA] rounded-full flex items-center justify-center text-white">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user.username}</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;