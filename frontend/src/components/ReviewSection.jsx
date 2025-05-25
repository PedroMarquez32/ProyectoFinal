import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReviewSection = ({ tripId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, [tripId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/trip/${tripId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para escribir una reseña');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          trip_id: tripId,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (response.ok) {
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-[#3a3a3c]">Opiniones de los Viajeros</h2>
      
      {/* Review Form */}
      <form onSubmit={handleSubmit} className="mb-8 border-b pb-8">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Valoración</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewReview({ ...newReview, rating: star })}
                className={`text-2xl ${
                  star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tu Opinión</label>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full border rounded-lg p-2 text-gray-900" // Añadido text-gray-900
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#4DA8DA] text-white px-4 py-2 rounded-lg hover:bg-[#3a8bb9]"
        >
          Enviar Reseña
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium">{review.username}</span>
                <span className="text-yellow-400 ml-2">
                  {'★'.repeat(review.rating)}
                </span>
                <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
              </div>
              <span className="text-gray-500 text-sm">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;