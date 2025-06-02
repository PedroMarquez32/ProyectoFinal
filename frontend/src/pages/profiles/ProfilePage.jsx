import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/common/PageTransition';
import { FaSuitcase, FaHeart, FaMagic, FaUserEdit, FaCalendarAlt, FaUser, FaMoneyBillWave, FaBed } from 'react-icons/fa';
import Spinner from '../../components/common/Spinner';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('myTrips');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [customTrips, setCustomTrips] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => { (async () => {
    await fetchUserData();
    await fetchUserBookings();
    await fetchUserFavorites();
    await fetchCustomTrips();
  })(); }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true); setUpdateError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditForm({ username: data.user.username, email: data.user.email });
      }
    } catch { setUpdateError('Error de conexión'); }
    finally { setLoading(false); }
  };

  const fetchUserBookings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/my-bookings`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(data.filter(b => b?.Trip?.id && b?.Trip?.title && b?.Trip?.destination)
        .map(b => ({ ...b, trip: b.Trip, start_date: b.departure_date, end_date: b.return_date })));
    } catch { setBookings([]); }
  };

  const fetchUserFavorites = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFavorites(data.filter(f => f?.Trip?.id && f?.Trip?.title).map(f => ({ ...f, trip: f.Trip })));
    } catch { setFavorites([]); }
  };

  const fetchCustomTrips = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/custom-trips/my-requests`, { credentials: 'include' });
      if (res.ok) setCustomTrips(await res.json());
    } catch {}
  };

  const validateForm = () => {
    const errors = {};
    if (!editForm.email) errors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(editForm.email)) errors.email = 'Email inválido';
    if (!editForm.username) errors.username = 'El username es requerido';
    else if (editForm.username.length < 3) errors.username = 'El username debe tener al menos 3 caracteres';
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setUpdateError(null);
    const errors = validateForm();
    if (Object.keys(errors).length) { setUpdateError('Por favor corrige los errores en el formulario'); setIsSubmitting(false); return; }
    try {
      setSaving(true); setSuccess("");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/update`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ email: editForm.email, username: editForm.username })
      });
      const data = await res.json();
      if (res.ok) { setIsEditing(false); fetchUserData(); setSuccess("¡Perfil actualizado correctamente!"); }
      else setUpdateError(data.message || 'Error al actualizar el perfil');
    } catch { setUpdateError('Error de conexión'); }
    finally { setIsSubmitting(false); setSaving(false); }
  };

  const handleRemoveFavorite = async (tripId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/toggle/${tripId}`, { method: 'POST', credentials: 'include' });
      if (res.ok) fetchUserFavorites();
    } catch {}
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('es-ES') : 'Fecha no disponible';

  // Card components
  const TripCard = ({ trip, status, start, end, participants, price, room, link }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center">
      <img src={trip.image || '/placeholder-image.jpg'} alt={trip.title} className="w-40 h-32 object-cover rounded-xl shadow" />
      <div className="flex-1">
        {status && (
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
              status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {status === 'PENDING' ? 'Pendiente' : status === 'CONFIRMED' ? 'Confirmado' : status === 'CANCELLED' ? 'Cancelado' : status}
            </span>
          </div>
        )}
        <h3 className="text-xl font-bold text-[#3a3a3c] mb-1">{trip.title}</h3>
        <div className="text-gray-500 mb-2">{trip.destination}</div>
        <div className="flex flex-wrap gap-4 text-gray-700 text-sm mb-2">
          {start && end && <span className="flex items-center gap-1"><FaCalendarAlt /> {formatDate(start)} - {formatDate(end)}</span>}
          {participants && <span className="flex items-center gap-1"><FaUser /> {participants} {participants === 1 ? 'persona' : 'personas'}</span>}
          {price && <span className="flex items-center gap-1"><FaMoneyBillWave /> {price}€</span>}
          {room && <span className="flex items-center gap-1"><FaBed /> {room}</span>}
        </div>
        {link && (
          <a href={link} className="inline-flex items-center text-[#4DA8DA] hover:text-[#3a8bb9] font-medium mt-2">
            Ver Detalles <span className="ml-1">→</span>
          </a>
        )}
      </div>
    </div>
  );

  const FavoriteCard = ({ fav, onRemove }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center">
      <img src={fav.trip.image || '/placeholder-image.jpg'} alt={fav.trip.title} className="w-40 h-32 object-cover rounded-xl shadow" />
      <div className="flex-1">
        <h3 className="text-xl font-bold text-[#3a3a3c] mb-1">{fav.trip.title}</h3>
        <div className="text-gray-500 mb-2">{fav.trip.destination}</div>
        <a href={`/destination/${fav.trip.id}`} className="inline-flex items-center text-[#4DA8DA] hover:text-[#3a8bb9] font-medium mt-2">
          Ver Detalles <span className="ml-1">→</span>
        </a>
      </div>
      <button onClick={() => onRemove(fav.trip.id)} className="ml-2 text-red-500 hover:text-red-700">Quitar</button>
    </div>
  );

  const CustomTripCard = ({ trip }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center">
      {trip.image ? (
        <img src={trip.image} alt={trip.destination} className="w-40 h-32 object-cover rounded-xl shadow" />
      ) : (
        <div className="w-40 h-32 bg-gradient-to-br from-[#4DA8DA]/30 to-[#2980B9]/10 rounded-xl flex items-center justify-center text-5xl text-[#4DA8DA]">
          <FaMagic />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <h3 className="text-xl font-bold text-[#3a3a3c] mb-1">{trip.destination}</h3>
        <div className="text-gray-500 mb-1"><FaCalendarAlt className="inline mr-1" />{formatDate(trip.departure_date)} - {formatDate(trip.return_date)}</div>
        <div className="flex flex-wrap gap-4 text-gray-700 text-sm mb-1">
          <span className="flex items-center gap-1"><FaUser /> Viajeros: {trip.number_of_participants}</span>
          <span className="flex items-center gap-1"><FaMoneyBillWave /> Presupuesto: {trip.budget_per_person?.toLocaleString('es-ES')}€</span>
          <span className="flex items-center gap-1"><FaBed /> Alojamiento: {trip.accommodation_type}</span>
        </div>
        {trip.preferences?.length > 0 && (
          <div className="mb-1">
            <span className="font-semibold text-[#4DA8DA]">Preferencias:</span>
            <span className="ml-2 text-gray-700">{Array.isArray(trip.preferences) ? trip.preferences.join(', ') : trip.preferences}</span>
          </div>
        )}
        {trip.email && <div className="text-gray-500 text-xs"><span className="font-semibold">Email:</span> {trip.email}</div>}
        {trip.status && (
          <div className="mt-1">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              trip.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              trip.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
              trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {trip.status === 'PENDING' ? 'Pendiente' : trip.status === 'CONFIRMED' ? 'Confirmado' : trip.status === 'CANCELLED' ? 'Cancelado' : trip.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const tabData = [
    {
      key: 'myTrips',
      label: <><FaSuitcase /> Mis Viajes ({bookings.length})</>,
      content: bookings.length
        ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{bookings.map(b =>
            <TripCard key={b.id} trip={b.trip} status={b.status} start={b.start_date} end={b.end_date}
              participants={b.number_of_participants} price={b.total_price} room={b.room_type}
              link={`/destination/${b.trip.id}`} />)}</div>
        : <div className="col-span-full text-center text-gray-500 py-12">No tienes viajes reservados todavía.</div>
    },
    {
      key: 'favorites',
      label: <><FaHeart /> Favoritos ({favorites.length})</>,
      content: favorites.length
        ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{favorites.map(f =>
            <FavoriteCard key={f.id} fav={f} onRemove={handleRemoveFavorite} />)}</div>
        : <div className="col-span-full text-center text-gray-500 py-12">No tienes destinos favoritos todavía.</div>
    },
    {
      key: 'customTrips',
      label: <><FaMagic /> Viajes Personalizados ({customTrips.length})</>,
      content: customTrips.length
        ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{customTrips.map(t =>
            <CustomTripCard key={t.id} trip={t} />)}</div>
        : <div className="col-span-full text-center text-gray-500 py-12">No tienes viajes personalizados todavía.</div>
    }
  ];

  if (loading ? (
    <div className="flex justify-center items-center py-8">
      <Spinner />
    </div>
  ) : updateError ? (
    <div className="text-red-500 text-center py-4">{updateError}</div>
  ) : !user) return <div></div>;

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-[#f6e7d7] pb-12">
          {/* Header de perfil */}
          <div className="w-full bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] py-12 mb-8 relative">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  {isEditing ? (
                    <form className="space-y-2" onSubmit={handleEditSubmit}>
                      <label className="block text-white/90 font-semibold text-lg" htmlFor="edit-username">Nombre de usuario</label>
                      <input id="edit-username" className="text-2xl font-bold text-[#22223b] bg-white border-2 border-[#4DA8DA] rounded-lg px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-[#4DA8DA] transition w-full"
                        value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} placeholder="Nombre de usuario" />
                      <label className="block text-white/90 font-semibold text-base mt-2" htmlFor="edit-email">Correo electrónico</label>
                      <input id="edit-email" className="text-base font-normal text-[#22223b] bg-white border-2 border-[#4DA8DA] rounded-lg px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-[#4DA8DA] transition w-full"
                        value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="Correo electrónico" />
                      <div className="flex gap-2 mt-2">
                        <button type="submit" className="bg-[#4DA8DA] text-white px-6 py-3 rounded-lg font-bold shadow transition flex items-center gap-2" disabled={saving}>
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                        <button type="button" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-bold shadow transition flex items-center gap-2"
                          onClick={() => setIsEditing(false)} disabled={saving}>Cancelar</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h1 className="text-3xl font-extrabold text-white mb-1">{user?.username}</h1>
                      <div className="flex gap-4 text-white/80 font-medium">
                        <span>Miembro desde {new Date(user?.created_at).getFullYear()}</span>
                        <span>•</span>
                        <span>{bookings.length} viajes reservados</span>
                      </div>
                      <div className="text-white/80 font-medium">{user?.email}</div>
                    </>
                  )}
                </div>
              </div>
              {!isEditing && (
                <div className="flex flex-col gap-2 mt-8 md:mt-0">
                  <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-bold shadow transition flex items-center gap-2"
                    onClick={() => setIsEditing(true)}>
                    <FaUserEdit className="text-xl" /> Editar Perfil
                  </button>
                </div>
              )}
            </div>
          </div>
          {success && <div className="container mx-auto px-4 -mt-8 mb-4"><div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">{success}</div></div>}
          {updateError && <div className="container mx-auto px-4 -mt-8 mb-4"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{updateError}</div></div>}
          {/* Tabs */}
          <div className="container mx-auto px-4">
            <div className="flex justify-start mb-8 gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-[#4DA8DA]/40 scrollbar-track-transparent">
              {tabData.map(tab => (
                <button key={tab.key}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow transition-all duration-200 text-lg whitespace-nowrap
                    ${activeTab === tab.key
                      ? 'bg-gradient-to-r from-[#4DA8DA] to-[#2980B9] text-white scale-105'
                      : tab.key === 'favorites'
                        ? 'bg-white text-pink-500 border-2 border-pink-300 hover:bg-pink-400 hover:text-white'
                        : 'bg-white text-[#4DA8DA] border-2 border-[#4DA8DA] hover:bg-[#4DA8DA] hover:text-white'
                    }`}
                  onClick={() => setActiveTab(tab.key)}
                >{tab.label}</button>
              ))}
            </div>
            <div className="mt-6">{tabData.find(tab => tab.key === activeTab)?.content}</div>
          </div>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
};

export default ProfilePage;