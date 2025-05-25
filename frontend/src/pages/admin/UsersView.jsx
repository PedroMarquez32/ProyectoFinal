import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null); // Renombrado para mayor claridad
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchCurrentAdminData();
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

  // Renombrado para mayor claridad
  const fetchCurrentAdminData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentAdmin(data.user);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleEditUser = async (userId) => {
    try {
      if (!editingUser) return;

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      // Actualizar la lista de usuarios
      setUsers(users.map(u => 
        u.id === userId ? { ...u, ...editingUser } : u
      ));
      setEditingUser(null);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Prevenir que un admin cambie su propio rol
      if (userId === currentAdmin?.id) {
        alert('No puedes cambiar tu propio rol');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT', // Cambiado de PATCH a PUT
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar el rol');
      }

      // Actualizar la lista de usuarios
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const renderRoleSelector = (userToEdit) => (
    <select
      value={userToEdit.role}
      onChange={(e) => handleRoleChange(userToEdit.id, e.target.value)}
      className="border rounded px-2 py-1 text-[#3a3a3c]"
      disabled={userToEdit.id === currentAdmin?.id} // Solo deshabilitar si es el admin actual
    >
      <option value="USER">User</option>
      <option value="ADMIN">Admin</option>
    </select>
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={currentAdmin} />
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
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-[#4DA8DA] focus:border-transparent"
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
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-[#4DA8DA] focus:border-transparent"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderRoleSelector(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditUser(user.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingUser(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setEditingUser(user)}
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