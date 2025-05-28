import { Link } from "react-router-dom";

const ErrorPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6e7d7]">
    <h1 className="text-5xl font-bold text-[#4DA8DA] mb-4">404</h1>
    <p className="text-xl text-gray-700 mb-8">¡Ups! La página que buscas no existe.</p>
    <Link
      to="/"
      className="bg-[#4DA8DA] text-white px-6 py-3 rounded-lg shadow hover:bg-[#357A9E] transition"
    >
      Volver al inicio
    </Link>
  </div>
);

export default ErrorPage; 