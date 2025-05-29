import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'people', label: 'Usuarios' },
    { path: '/admin/destinations', icon: 'place', label: 'Destinos' },
    { path: '/admin/bookings', icon: 'book', label: 'Reservas' },
    { path: '/admin/finances', icon: 'attach_money', label: 'Pagos' },
    { path: '/admin/reviews', icon: 'star', label: 'Reseñas' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white z-30 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static">
      <div className="flex flex-col h-full">
        <Link to="/" className="block shrink-0">
          <div className="p-4 border-b border-gray-700 hover:bg-[#4a4a4c] transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xl">TravelDream</span>
            </div>
            <div className="text-sm text-gray-400">Admin Dashboard</div>
          </div>
        </Link>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`flex items-center gap-3 p-3 text-white hover:bg-[#4DA8DA] rounded transition-colors ${
                    location.pathname === item.path ? 'bg-[#4DA8DA]' : ''
                  }`}
                >
                  <span className="material-icons text-[20px]">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <div className="p-4 border-t border-gray-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4DA8DA] rounded-full flex items-center justify-center text-white">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.username}</div>
                <div className="text-xs text-gray-400">Administrator</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;