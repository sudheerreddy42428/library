import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RegisterStudent from './pages/auth/RegisterStudent';
import RegisterLibrarian from './pages/auth/RegisterLibrarian';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Books from './pages/admin/Books';
import Issues from './pages/admin/Issues';
import Fines from './pages/admin/Fines';
import Analytics from './pages/admin/Analytics';
import PurchaseRequestsAdmin from './pages/admin/PurchaseRequests';
import BookConditions from './pages/admin/BookConditions';
import SeatManagement from './pages/admin/SeatManagement';
import SystemSettings from './pages/admin/SystemSettings';
import Reservations from './pages/admin/Reservations';
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseBooks from './pages/student/BrowseBooks';
import MyBooks from './pages/student/MyBooks';
import RequestBook from './pages/student/RequestBook';
import SeatBooking from './pages/student/SeatBooking';
import DigitalLibraryCard from './pages/student/DigitalLibraryCard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} /> : <Login />} />
      <Route path="/register/student" element={<RegisterStudent />} />
      <Route path="/register/librarian" element={<RegisterLibrarian />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="issues" element={<Issues />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="fines" element={<Fines />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="purchase-requests" element={<PurchaseRequestsAdmin />} />
        <Route path="book-conditions" element={<BookConditions />} />
        <Route path="seats" element={<SeatManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><MainLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="browse" element={<BrowseBooks />} />
        <Route path="my-books" element={<MyBooks />} />
        <Route path="request-book" element={<RequestBook />} />
        <Route path="book-seat" element={<SeatBooking />} />
        <Route path="id-card" element={<DigitalLibraryCard />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
