import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
};

export default Layout; 