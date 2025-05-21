import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import CustomTripPage from './pages/CustomTripPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import UsersView from './pages/admin/UsersView';
import DestinationsView from './pages/admin/DestinationsView';
import BookingsView from './pages/admin/BookingsView';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/destination/:id" element={<DestinationDetailPage />} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />

      {/* Protected routes */}
      <Route 
        path="/custom-trip" 
        element={
          <ProtectedRoute>
            <Layout><CustomTripPage /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        } 
      />

      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <Layout><AdminDashboard /></Layout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <Layout><UsersView /></Layout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/destinations" 
        element={
          <AdminRoute>
            <Layout><DestinationsView /></Layout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/bookings" 
        element={
          <AdminRoute>
            <Layout><BookingsView /></Layout>
          </AdminRoute>
        } 
      />
    </Routes>
  );
}

export default App;
