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
        // Normaliza el username para cada review
        const normalized = data.map(r => ({
          ...r,
          username: r.username || r.User?.username || "?"
        }));
        setReviews(normalized);
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
        const reviewData = await response.json();
        // Añadir la nueva review al estado local inmediatamente
        setReviews([
          {
            ...reviewData,
            username: user.username,
            created_at: new Date().toISOString()
          },
          ...reviews
        ]);
        setNewReview({ rating: 5, comment: '' });
      }
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-[#3a3a3c]">Opiniones de los Viajeros</h2>
      
      {/* Review Form */}
      <form onSubmit={handleSubmit} className="mb-10 border-b pb-10">
        <div className="flex items-center gap-4 mb-4">
          {user && (
            <div className="w-10 h-10 rounded-full bg-[#4DA8DA] flex items-center justify-center text-white font-bold text-xl">
              {user.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Valoración</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`focus:outline-none bg-transparent border-none p-0 m-0 text-4xl transition-all duration-200
                    ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}
                    hover:text-yellow-300 hover:scale-125 cursor-pointer`}
                  style={{ lineHeight: 1 }}
                  tabIndex={0}
                  aria-label={`Valorar con ${star} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold">Tu Opinión</label>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full border rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[#4DA8DA] shadow-sm transition"
            rows="4"
            required
            placeholder="¿Qué te ha parecido este destino?"
          />
        </div>
        <button
          type="submit"
          className="bg-[#4DA8DA] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#3a8bb9] font-bold text-lg transition"
        >
          Enviar Reseña
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 && (
          <div className="text-gray-400 text-center py-8">¡Sé el primero en dejar una reseña!</div>
        )}
        {reviews.map((review, idx) => (
          <div
            key={review.id}
            className={`flex items-start gap-4 p-6 rounded-xl shadow-sm ${
              idx % 2 === 0 ? 'bg-[#F7FAFC]' : 'bg-white'
            } border-l-4 ${review.rating >= 4 ? 'border-[#4DA8DA]' : 'border-gray-200'}`}
          >
            <div className="w-10 h-10 rounded-full bg-[#4DA8DA] flex items-center justify-center text-white font-bold text-xl">
              {review.User?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">{review.User?.username || "Usuario"}</span>
                <span className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
                {[...Array(5 - review.rating)].map((_, i) => (
                  <span key={i} className="text-gray-300 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;