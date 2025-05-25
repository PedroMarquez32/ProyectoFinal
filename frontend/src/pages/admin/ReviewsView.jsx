import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

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

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
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
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
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

  const handleApprovalChange = async (reviewId, isApproved) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_approved: isApproved })
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdate = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={user} />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#3a3a3c] mb-8">Reviews Management</h1>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprovalChange(review.id, !review.is_approved)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            review.is_approved
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {review.is_approved ? 'Disapprove' : 'Approve'}
                        </button>
                        {editingReview?.id === review.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(review.id)}
                              className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingReview(null)}
                              className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingReview(review)}
                            className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsView;