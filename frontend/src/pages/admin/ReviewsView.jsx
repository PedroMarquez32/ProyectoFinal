import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageTransition from '../../components/common/PageTransition';
import { buttonStyles } from '../../styles/buttons';
import Spinner from '../../components/common/Spinner';

const ReviewsView = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUserData();
    fetchReviews();
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

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          await fetchReviews();
        } else {
          throw new Error('Error deleting review');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la reseña');
      }
    }
  };

  const handleUpdate = async (reviewId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: editingReview.rating,
          comment: editingReview.comment
        })
      });

      if (response.ok) {
        fetchReviews();
        setEditingReview(null);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error al actualizar la reseña');
    }
  };

  const handleStatusChange = async (reviewId, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchReviews();
      } else {
        throw new Error('Error updating status');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado de la reseña');
    }
  };

  const handleEdit = (review) => {
    setEditingReview({ ...review });
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment: editingReview.comment })
      });
      if (!response.ok) throw new Error('Error updating review');
      await fetchReviews();
      setEditingReview(null);
    } catch (error) {
      alert('Error updating review');
    }
  };

  const renderActionButtons = (review) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEdit(review)}
        className={buttonStyles.editButton}
      >
        Edit
      </button>
      <button
        onClick={() => handleDelete(review.id)}
        className={buttonStyles.deleteButton}
      >
        Delete
      </button>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar user={user} />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Gestión de Reseñas</h1>

            {loading ? (
              <Spinner />
            ) : (
              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valoración</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comentario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{review.Trip?.title || 'Destino no disponible'}</div>
                          <div className="text-sm text-gray-500">{review.Trip?.destination || 'Ubicación no disponible'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {editingReview?.id === review.id ? (
                            <select
                              value={editingReview.rating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                rating: parseInt(e.target.value)
                              })}
                              className="border rounded px-2 py-1"
                            >
                              {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num} ⭐</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingReview?.id === review.id ? (
                            <textarea
                              value={editingReview.comment}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                comment: e.target.value
                              })}
                              className="w-full border rounded p-2"
                              rows="2"
                            />
                          ) : (
                            review.comment
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            review.is_approved 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {review.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {editingReview?.id === review.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveEdit(review.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingReview(null)}
                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            renderActionButtons(review)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ReviewsView;