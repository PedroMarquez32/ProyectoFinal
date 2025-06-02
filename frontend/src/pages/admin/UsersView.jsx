import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageTransition from '../../components/common/PageTransition'; // Asegúrate de que la ruta sea correcta
import Spinner from '../../components/common/Spinner';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/role`, {
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={currentAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <Spinner fullScreen />
        </div>
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;

  return (
    <PageTransition>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={currentAdmin} />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold mb-6 text-[#3a3a3c]">Gestión de Usuarios</h1>
            
            <div className="bg-white rounded-lg shadow h-[calc(100vh-10rem)]">
              <div className="overflow-auto h-full">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Correo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#3a3a3c] uppercase">Acciones</th>
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
                                Guardar
                              </button>
                              <button 
                                onClick={() => setEditingUser(null)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setEditingUser(user)}
                                className="text-[#4DA8DA] hover:text-[#3a8bb9]"
                              >
                                Editar
                              </button>
                            </div>
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
      </div>
    </PageTransition>
  );
};

export default UsersView;