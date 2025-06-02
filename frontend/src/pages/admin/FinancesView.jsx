import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageTransition from '../../components/common/PageTransition';
import { buttonStyles } from '../../styles/buttons';


const statusLabels = {
  completed: 'Completados',
  pending: 'Pendientes',
  cancelled: 'Cancelados'
};

const FinancesView = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [editingAmount, setEditingAmount] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    booking_id: '', user_id: '', amount: '', status: 'PENDING', customer_name: '', customer_email: ''
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchUserData(); fetchTransactions(); }, [dateRange]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) setUser((await res.json()).user);
    } catch {}
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/finances/transactions?range=${dateRange}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTransactions(data.transactions.map(t => ({
        ...t,
        customer_name: t.customer_name || t.User?.username || t.Booking?.User?.username || "Usuario no disponible",
        customer_email: t.customer_email || t.User?.email || t.Booking?.User?.email || ""
      })));
      setTotalRevenue(data.totalRevenue);
    } catch { } finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/finances/transactions/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
      await fetchTransactions();
    } catch { alert('Error al actualizar el estado del pago'); }
  };

  const handleAmountEdit = async (id, amount) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/finances/transactions/${id}/amount`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ amount })
      });
      if (!res.ok) throw new Error();
      await fetchTransactions();
      setEditingAmount(null);
    } catch { alert('Error al actualizar el monto'); }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault(); setAdding(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/finances/manual`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(newPayment)
      });
      if (!res.ok) throw new Error();
      setShowAddModal(false);
      setNewPayment({ booking_id: '', user_id: '', amount: '', status: 'PENDING', customer_name: '', customer_email: '' });
      await fetchTransactions();
    } catch { alert('Error adding payment'); } finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pago?')) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/finances/transactions/${id}`, { method: 'DELETE', credentials: 'include' });
    await fetchTransactions();
  };

  const handleRefund = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas procesar este reembolso?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/finances/refund/${id}`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error();
      await fetchTransactions();
      alert('Reembolso procesado correctamente');
    } catch { alert('Error al procesar el reembolso'); }
  };

  const statusOptions = [
    { value: 'COMPLETED', label: 'Confirmar', style: buttonStyles.statusButton.confirmed },
    { value: 'PENDING', label: 'Pendiente', style: buttonStyles.statusButton.pending },
    { value: 'CANCELLED', label: 'Cancelar', style: buttonStyles.statusButton.cancelled }
  ];

  return (
    <PageTransition>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={user} />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Gestión Financiera</h1>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Ingresos Totales</h3>
                <p className="text-2xl font-bold text-gray-900">€{totalRevenue.toLocaleString('es-ES')}</p>
              </div>
              {['pending', 'completed'].map(status => (
                <div key={status} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Pagos {statusLabels[status]}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.filter(t => t.status === status).length}
                  </p>
                </div>
              ))}
            </div>
            {/* Add Payment Button */}
            <button className="mb-4 px-4 py-2 bg-[#4DA8DA] text-white rounded hover:bg-[#3a8bb9]" onClick={() => setShowAddModal(true)}>
              Añadir Pago
            </button>
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleAddPayment}>
                  <h2 className="text-xl font-bold mb-4 text-black">Add Payment</h2>
                  {['customer_name', 'customer_email', 'booking_id', 'user_id', 'amount'].map(field => (
                    <div key={field}>
                      <label className="block mb-2 text-black">{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                      <input
                        className="border rounded px-2 py-1 w-full mb-4 text-black"
                        value={newPayment[field] || ''}
                        onChange={e => setNewPayment({ ...newPayment, [field]: e.target.value })}
                        placeholder={field === 'amount' ? undefined : `${field.replace('_', ' ')} (optional)`}
                        type={field === 'amount' ? 'number' : 'text'}
                        min={field === 'amount' ? 0 : undefined}
                        step={field === 'amount' ? 0.01 : undefined}
                        required={field === 'amount'}
                      />
                    </div>
                  ))}
                  <label className="block mb-2 text-black">Status</label>
                  <select className="border rounded px-2 py-1 w-full mb-4 text-black"
                    value={newPayment.status}
                    onChange={e => setNewPayment({ ...newPayment, status: e.target.value })}>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button type="button" className="px-4 py-2 bg-gray-300 rounded text-black" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-[#4DA8DA] text-white rounded hover:bg-[#3a8bb9]" disabled={adding}>
                      {adding ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Historial de Transacciones</h2>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-64"><Spinner /></div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['ID de Transacción', 'Cliente', 'Monto', 'Estado', 'Fecha', 'Acciones'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No transactions found</td>
                        </tr>
                      ) : (
                        transactions.map(transaction => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{transaction.customer_name}</span>
                                {transaction.customer_email && <span className="text-sm text-gray-500">{transaction.customer_email}</span>}
                                {transaction.user_id && <span className="text-xs text-gray-400">ID: {transaction.user_id}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center justify-between">
                                {editingAmount?.id === transaction.id ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      value={editingAmount.amount}
                                      onChange={e => setEditingAmount({ ...editingAmount, amount: parseFloat(e.target.value) })}
                                      className="w-24 border rounded px-2 py-1"
                                      min="0"
                                      step="0.01"
                                    />
                                    <button onClick={() => handleAmountEdit(transaction.id, editingAmount.amount)}
                                      className="px-2 py-1 bg-[#1a1a1a] text-white rounded hover:bg-gray-800">✓</button>
                                    <button onClick={() => setEditingAmount(null)}
                                      className="px-2 py-1 bg-[#1a1a1a] text-white rounded hover:bg-gray-800">✕</button>
                                  </div>
                                ) : (
                                  <>
                                    <span>€{transaction.amount.toLocaleString('es-ES')}</span>
                                    <button onClick={() => setEditingAmount({ id: transaction.id, amount: transaction.amount })}
                                      className={buttonStyles.editButton}><span className="text-lg">✎</span></button>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`
                                px-2 py-1 text-xs font-medium rounded-full ${
                                  transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  transaction.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`
                              }>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center space-x-2">
                                {statusOptions.map(opt => (
                                  <button key={opt.value}
                                    onClick={() => handleStatusChange(transaction.id, opt.value)}
                                    className={`${buttonStyles.statusButton.base} ${opt.style} ${transaction.status === opt.value ? buttonStyles.statusButton.active : ''}`}>
                                    {opt.label}
                                  </button>
                                ))}
                                <button onClick={() => handleDelete(transaction.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FinancesView;