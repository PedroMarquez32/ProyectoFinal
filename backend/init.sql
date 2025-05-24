-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Primero eliminamos las tablas existentes en orden correcto para evitar problemas de dependencias
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS custom_trips CASCADE;
DROP TABLE IF EXISTS trip_features CASCADE;
DROP TABLE IF EXISTS trip_images CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar tipos ENUM
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS custom_trip_status CASCADE;

-- Crear los tipos ENUM
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE notification_type AS ENUM ('BOOKING_UPDATE', 'TRIP_REMINDER', 'CUSTOM_TRIP_UPDATE', 'FAVORITE_UPDATE', 'SYSTEM');
CREATE TYPE notification_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE custom_trip_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- Crear tablas en orden correcto
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    phone_number VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Crear tabla de viajes
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- Añadida columna duration
    rating DECIMAL(2,1),
    image VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    original_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    overview TEXT,
    highlights TEXT[],
    itinerary JSONB
);

-- Crear tabla de características
CREATE TABLE features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- Crear tabla de asociación trip_features
CREATE TABLE trip_features (
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (trip_id, feature_id)
);

-- Crear tabla de imágenes
CREATE TABLE trip_images (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de viajes personalizados
CREATE TABLE custom_trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    destination VARCHAR(255) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    number_of_participants INTEGER NOT NULL,
    budget_per_person DECIMAL(10,2) NOT NULL,
    interests TEXT[] NOT NULL,
    accommodation_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Eliminar tabla existente
DROP TABLE IF EXISTS bookings CASCADE;

-- Crear tabla de reservas con las fechas correctas
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    trip_id INTEGER REFERENCES trips(id),
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    room_type VARCHAR(50),
    number_of_participants INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    status booking_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de reseñas
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de favoritos
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, trip_id)
);

-- Crear tabla de notificaciones
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    priority notification_priority NOT NULL DEFAULT 'MEDIUM',
    is_read BOOLEAN DEFAULT false,
    notification_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_trips_destination ON trips(destination);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX idx_reviews_trip_id ON reviews(trip_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_custom_trips_user_id ON custom_trips(user_id);
CREATE INDEX idx_custom_trips_status ON custom_trips(status);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Insertar usuarios de prueba (actualizado con un usuario adicional)
INSERT INTO users (email, username, hashed_password, role, full_name, phone_number, address, is_active) 
VALUES 
    ('admin@traveldream.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFpcqIYC1QyHgK6', 'ADMIN', 'Admin User', '+34600000000', 'Calle Admin 123', true),
    ('prueba@gmail.com', 'prueba', '$2b$12$1Zw/jdqPVHNh.yVTwYz9/.vK0Q3G7EhB2dYoZFBcqwxK7s9v7fF0.', 'USER', 'Usuario Prueba', '+34600000001', 'Calle Prueba 123', true),
    ('test@gmail.com', 'test', '$2b$12$1Zw/jdqPVHNh.yVTwYz9/.vK0Q3G7EhB2dYoZFBcqwxK7s9v7fF0.', 'USER', 'Test User', '+34600000002', 'Calle Test 123', true);

-- Primero insertamos los viajes base
INSERT INTO trips (title, destination, description, price, duration, rating, image, start_date, end_date, max_participants, original_price, is_active) 
VALUES 
('Santorini Dream', 'Santorini, Greece', 'Experience the enchanting white-washed buildings, blue domes, and breathtaking sunsets in this iconic Greek town.', 899.99, 7, 4.8, 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3...', '2025-06-01', '2025-06-07', 20, 999.99, true),
('Bali Paradise', 'Bali, Indonesia', 'Discover lush landscapes, ancient temples, and the rich cultural heritage of this tropical paradise.', 1199.99, 9, 4.6, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4...', '2025-06-15', '2025-06-23', 15, 1299.99, true),
('Maldives Escape', 'Maldives', 'Indulge in luxury, overwater bungalows and pristine white sand beaches.', 1599.99, 8, 4.9, 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8...', '2025-07-01', '2025-07-08', 10, 1799.99, true),
('Tokyo Adventure', 'Tokyo, Japan', 'A city that perfectly blends ancient traditions and cutting-edge technology.', 1799.99, 9, 4.7, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf...', '2025-07-10', '2025-07-18', 12, 1999.99, true),
('Machu Picchu Explorer', 'Machu Picchu, Perú', 'Explore this ancient Incan city high in the Andes Mountains.', 2299.99, 8, 4.9, 'https://images.unsplash.com/photo-1526392060635-9d6019884377...', '2025-08-01', '2025-08-08', 15, 2499.99, true),
('Barcelona Discovery', 'Barcelona, Spain', 'Immerse yourself in the vibrant culture and stunning architecture.', 1099.99, 6, 4.6, 'https://images.unsplash.com/photo-1583422409516-2895a77efded...', '2025-08-15', '2025-08-20', 20, 1299.99, true);

-- Luego insertamos las características
INSERT INTO features (name, description) 
VALUES 
    ('All-Inclusive', 'Todas las comidas incluidas'),
    ('Guided Tours', 'Tours guiados incluidos'),
    ('Luxury Hotel', 'Alojamiento de lujo');

-- Finalmente relacionamos los viajes con las características
INSERT INTO trip_features (trip_id, feature_id) 
VALUES 
    (1, 1), (1, 2), (1, 3), -- Santorini
    (2, 1), (2, 2),        -- Bali
    (3, 2), (3, 3);        -- Maldives

-- Insertar imágenes después de tener los viajes
INSERT INTO trip_images (trip_id, image_url, is_main) 
VALUES 
    (1, 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e...', true),
    (2, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4...', true),
    (3, 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8...', true);

-- Insertar bookings de ejemplo con las fechas correctas
INSERT INTO bookings (user_id, trip_id, departure_date, return_date, room_type, number_of_participants, total_price, status) 
VALUES 
    (1, 1, '2025-05-25', '2025-05-28', 'standard', 2, 1200.00, 'PENDING'),
    (2, 2, '2025-06-15', '2025-06-18', 'deluxe', 3, 2500.00, 'CONFIRMED'),
    (2, 3, '2025-07-10', '2025-07-13', 'superior', 2, 1800.00, 'PENDING');

-- Insertar favoritos de ejemplo
INSERT INTO favorites (user_id, trip_id)
VALUES 
    (2, 1),
    (2, 3);

-- Actualizar los viajes con información detallada
UPDATE trips 
SET overview = 'Descubre la magia de Santorini, una joya en el corazón del mar Egeo. Sus características casas blancas con cúpulas azules, espectaculares atardeceres y playas volcánicas te esperan.',
    highlights = ARRAY['Atardecer en Oia', 'Playas volcánicas', 'Cata de vinos local', 'Excursión en barco por la caldera', 'Pueblos tradicionales', 'Gastronomía griega'],
    itinerary = '[
      {
        "day": 1,
        "title": "Llegada a Santorini",
        "activities": ["Traslado al hotel", "Paseo de orientación por Fira", "Cena de bienvenida con vistas a la caldera"]
      },
      {
        "day": 2,
        "title": "Exploración de Oia",
        "activities": ["Visita al pueblo de Oia", "Sesión fotográfica en las cúpulas azules", "Atardecer en el castillo de Oia"]
      },
      {
        "day": 3,
        "title": "Aventura volcánica",
        "activities": ["Excursión en barco a la isla volcánica", "Aguas termales", "Snorkel en el mar Egeo"]
      }
    ]'::jsonb
WHERE destination = 'Santorini, Greece';

UPDATE trips 
SET overview = 'Bali, conocida como la Isla de los Dioses, te ofrece una perfecta combinación de cultura, naturaleza y relajación. Cada rincón tiene una historia que contar.',
    highlights = ARRAY['Templos ancestrales', 'Terrazas de arroz', 'Playas tropicales', 'Spa balinés', 'Clase de cocina local', 'Danzas tradicionales'],
    itinerary = '[
      {
        "day": 1,
        "title": "Bienvenida a Bali",
        "activities": ["Recepción tradicional balinesa", "Check-in en el resort", "Ceremonia de purificación"]
      },
      {
        "day": 2,
        "title": "Cultura y Naturaleza",
        "activities": ["Visita a las terrazas de arroz", "Templo Ulun Danu Beratan", "Mercado tradicional"]
      },
      {
        "day": 3,
        "title": "Experiencia playera",
        "activities": ["Clase de surf en Kuta", "Masaje balinés", "Cena en la playa"]
      }
    ]'::jsonb
WHERE destination = 'Bali, Indonesia';

UPDATE trips 
SET overview = 'Descubre el lujo y la serenidad de las Maldivas, donde las aguas cristalinas y los bungalows sobre el agua crean el escenario perfecto para unas vacaciones inolvidables.',
    highlights = ARRAY['Bungalows sobre el agua', 'Snorkel con mantarrayas', 'Cenas gourmet', 'Spa sobre el océano', 'Excursión en hidroavión', 'Puesta de sol en dhoni'],
    itinerary = '[
      {
        "day": 1,
        "title": "Paraíso encontrado",
        "activities": ["Traslado en hidroavión", "Check-in en bungalow sobre el agua", "Cena bajo las estrellas"]
      },
      {
        "day": 2,
        "title": "Aventuras acuáticas",
        "activities": ["Snorkel en el arrecife de coral", "Almuerzo en restaurante submarino", "Crucero al atardecer"]
      },
      {
        "day": 3,
        "title": "Relax total",
        "activities": ["Tratamiento de spa", "Picnic en banco de arena", "Cena romántica en la playa"]
      }
    ]'::jsonb
WHERE destination = 'Maldives';

UPDATE trips 
SET overview = 'Explora la fascinante mezcla de tradición y modernidad en Tokio. Desde templos antiguos hasta rascacielos futuristas, la capital japonesa te sorprenderá.',
    highlights = ARRAY['Templo Senso-ji', 'Cruce de Shibuya', 'Tour gastronómico', 'Barrio de Akihabara', 'Jardín Imperial', 'Mercado de Tsukiji'],
    itinerary = '[
      {
        "day": 1,
        "title": "Bienvenidos a Tokio",
        "activities": ["Traslado al hotel", "Visita al templo Senso-ji", "Cena en Izakaya tradicional"]
      },
      {
        "day": 2,
        "title": "Tokio moderno",
        "activities": ["Cruce de Shibuya", "Harajuku y Omotesando", "Vista nocturna desde Tokyo Skytree"]
      },
      {
        "day": 3,
        "title": "Cultura y tradición",
        "activities": ["Mercado de Tsukiji", "Ceremonia del té", "Cena de sushi"]
      }
    ]'::jsonb
WHERE destination = 'Tokyo, Japan';

UPDATE trips 
SET overview = 'Descubre la misteriosa ciudad perdida de los Incas. Machu Picchu te cautivará con su arquitectura ingeniosa y vistas breathtaking de los Andes.',
    highlights = ARRAY['Ciudad Inca', 'Valle Sagrado', 'Tren panorámico', 'Ruinas de Ollantaytambo', 'Mercado de Pisac', 'Ceremonias tradicionales'],
    itinerary = '[
      {
        "day": 1,
        "title": "Llegada a Cusco",
        "activities": ["Traslado al hotel", "Tour por Cusco", "Cena de bienvenida"]
      },
      {
        "day": 2,
        "title": "Valle Sagrado",
        "activities": ["Visita a Pisac", "Almuerzo tradicional", "Ruinas de Ollantaytambo"]
      },
      {
        "day": 3,
        "title": "Machu Picchu",
        "activities": ["Tren a Aguas Calientes", "Visita guiada a Machu Picchu", "Ritual tradicional"]
      }
    ]'::jsonb
WHERE destination = 'Machu Picchu, Perú';

UPDATE trips 
SET overview = 'Sumérgete en la vibrante cultura catalana. Barcelona te enamorará con su arquitectura única, gastronomía excepcional y ambiente mediterráneo.',
    highlights = ARRAY['Sagrada Familia', 'Parque Güell', 'Las Ramblas', 'Barrio Gótico', 'Mercado de La Boquería', 'Playas urbanas'],
    itinerary = '[
      {
        "day": 1,
        "title": "Bienvenidos a Barcelona",
        "activities": ["Traslado al hotel", "Paseo por Las Ramblas", "Cena de tapas"]
      },
      {
        "day": 2,
        "title": "Gaudí y Modernismo",
        "activities": ["Visita a la Sagrada Familia", "Parque Güell", "Casa Batlló"]
      },
      {
        "day": 3,
        "title": "Barcelona Histórica",
        "activities": ["Tour por el Barrio Gótico", "Mercado de La Boquería", "Cena catalana"]
      }
    ]'::jsonb
WHERE destination = 'Barcelona, Spain';

-- Actualizar los viajes con las URLs de imágenes correctas
UPDATE trips
SET image = CASE 
    WHEN title = 'Santorini Dream' THEN 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    WHEN title = 'Bali Paradise' THEN 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80'
    WHEN title = 'Maldives Escape' THEN 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1765&q=80'
    WHEN title = 'Tokyo Adventure' THEN 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1194&q=80'
    WHEN title = 'Machu Picchu Explorer' THEN 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    WHEN title = 'Barcelona Discovery' THEN 'https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
END;

-- Permisos (actualizados para usar postgres)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;