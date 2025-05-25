import React from 'react';
import { Link } from 'react-router-dom';

const DestinationCard = ({ destination }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <img 
        src={destination.image} 
        alt={destination.title} 
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = '/placeholder-image.jpg';
        }}
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2">{destination.title}</h3>
        <p className="text-gray-600 mb-2">{destination.destination}</p>
        
        {/* Añadimos la descripción */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {destination.description || destination.overview || 'No hay descripción disponible'}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-gray-800 font-bold">{destination.price}€</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>⭐ {destination.rating}/5</span>
              <span>•</span>
              <span>{destination.duration} días</span>
            </div>
          </div>
          <Link 
            to={`/destination/${destination.id}`}
            className="inline-block bg-[#4DA8DA] text-white px-4 py-2 rounded hover:bg-[#357A9E] transition-colors"
          >
            Ver más
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;