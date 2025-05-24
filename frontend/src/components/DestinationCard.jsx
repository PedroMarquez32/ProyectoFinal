import React from 'react';
import { Link } from 'react-router-dom';

const DestinationCard = ({ destination }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={destination.image} 
        alt={destination.title} 
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = '/placeholder-image.jpg';
        }}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{destination.title}</h3>
        <p className="text-gray-600 mb-2">{destination.destination}</p>
        <p className="text-gray-800 font-bold">{destination.price}€</p>
        <Link 
          to={`/destination/${destination.id}`}
          className="mt-3 inline-block bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#357A9E] transition-colors"
        >
          Ver más
        </Link>
      </div>
    </div>
  );
};

export default DestinationCard;