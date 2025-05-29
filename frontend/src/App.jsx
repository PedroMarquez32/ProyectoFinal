import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DestinationsPage from './pages/destinations/DestinationsPage';
import DestinationDetailPage from './pages/destinations/DestinationDetailPage';
import CustomTripPage from './pages/destinations/CustomTripPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/profiles/ProfilePage';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import UsersView from './pages/admin/UsersView';
import DestinationsView from './pages/admin/DestinationsView';
import BookingsView from './pages/admin/BookingsView';
import ReviewsView from './pages/admin/ReviewsView';
import FinancesView from './pages/admin/FinancesView';
import ErrorPage from './pages/ErrorPage';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
        <Route 
          path="/admin/reviews" 
          element={
            <AdminRoute>
              <Layout><ReviewsView /></Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/finances" 
          element={
            <ProtectedRoute>
              <AdminRoute>
                <FinancesView />
              </AdminRoute>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
