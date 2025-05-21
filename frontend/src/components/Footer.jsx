const Footer = () => {
  return (
    <footer className="bg-[#3a3a3c] text-[#f6e7d7] py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">TravelDream</h3>
            <p className="text-sm">
              Explora el mundo con nosotros y haz realidad tus sueños de viaje.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2">
              <li><a href="/destinations" className="hover:text-[#4DA8DA]">Destinos</a></li>
              <li><a href="/packages" className="hover:text-[#4DA8DA]">Paquetes</a></li>
              <li><a href="/about" className="hover:text-[#4DA8DA]">Sobre nosotros</a></li>
              <li><a href="/contact" className="hover:text-[#4DA8DA]">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li>Email: info@traveldream.com</li>
              <li>Tel: +34 123 456 789</li>
              <li>Madrid, España</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#4DA8DA]">Facebook</a>
              <a href="#" className="hover:text-[#4DA8DA]">Instagram</a>
              <a href="#" className="hover:text-[#4DA8DA]">Twitter</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>&copy; 2025 TravelDream. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 