import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = ({ user }) => {
  const location = useLocation();

  return (
    <div className="w-64 bg-[#3a3a3c] min-h-screen fixed left-0">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
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