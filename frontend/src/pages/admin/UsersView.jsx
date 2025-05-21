import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchUserData();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Error fetching users');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        fetchUsers(); // Refresh users list
      } else {
        throw new Error('Error updating user role');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating user role');
    }
  };

  const handleEditUser = (userId) => {
    const userToEdit = users.find(u => u.id === userId);
    setEditingUser({
      id: userToEdit.id,
      username: userToEdit.username,
      email: userToEdit.email
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: editingUser.username,
          email: editingUser.email
        })
      });

      if (response.ok) {
        fetchUsers();
        setEditingUser(null);
      } else {
        throw new Error('Error updating user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating user');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
              <Link to="/admin" className="flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">dashboard</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="flex items-center gap-3 p-2 text-white bg-[#4DA8DA] rounded transition-colors">
                <span className="material-icons">people</span>
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/destinations" className="flex items-center gap-3 p-2 text-white hover:bg-[#4DA8DA] rounded transition-colors">
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
        <h1 className="text-2xl font-bold mb-6 text-[#3a3a3c]">Users Management</h1>
        
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">
                      {editingUser?.id === user.id ? (
                        <input
                          type="text"
                          value={editingUser.username}
                          onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        user.username
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#3a3a3c]">
                      {editingUser?.id === user.id ? (
                        <input
                          type="email"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border rounded px-2 py-1 text-[#3a3a3c]"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <>
                          <button 
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800 mr-2"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingUser(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleEditUser(user.id)}
                          className="text-[#4DA8DA] hover:text-[#3a8bb9]"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersView;