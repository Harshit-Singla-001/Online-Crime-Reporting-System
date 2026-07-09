import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import AppFooter from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import SignupStep1 from './pages/auth/SignupStep1';
import VerifyOTP from './pages/auth/VerifyOTP';
import CompleteSignup from './pages/auth/CompleteSignup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ForgotOTP from './pages/auth/ForgotOTP';
import ForgotKey from './pages/auth/ForgotKey';
import ResetPassword from './pages/auth/ResetPassword';

// User Pages
import Home from './pages/user/Home';
import FileFIR from './pages/user/FileFIR';
import MyFIRs from './pages/user/MyFIRs';
import MyFIRDetails from './pages/user/MyFIRDetails';
import FIRRecords from './pages/user/FIRRecords';
import FIRDetails from './pages/user/FIRDetails';
import SafetyTips from './pages/user/SafetyTips';
import About from './pages/user/About';
import Contact from './pages/user/Contact';
import Profile from './pages/user/Profile';
import PrivacyPolicy from './pages/user/PrivacyPolicy';
import TermsOfService from './pages/user/TermsOfService';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageFIRs from './pages/admin/ManageFIRs';
import AdminFIRDetails from './pages/admin/AdminFIRDetails';
import ManageUsers from './pages/admin/ManageUsers';
import ManageTips from './pages/admin/ManageTips';
import SiteSettings from './pages/admin/SiteSettings';
import AdminProfile from './pages/admin/AdminProfile';
import Help from './pages/admin/Help';
import ContactMessages from './pages/admin/ContactMessages';

import { Spinner, Container } from 'react-bootstrap';

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/home" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100 bg-primary-dark">
          <AppNavbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Root and Convenience Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

              {/* Authentication Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<SignupStep1 />} />
              <Route path="/auth/verify-otp" element={<VerifyOTP />} />
              <Route path="/auth/complete-signup" element={<CompleteSignup />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/forgot-otp" element={<ForgotOTP />} />
              <Route path="/auth/forgot-key" element={<ForgotKey />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />

              {/* User Protected Routes */}
              <Route path="/user/home" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/user/fir/file-fir" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <FileFIR />
                </ProtectedRoute>
              } />
              <Route path="/user/fir/my-firs" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MyFIRs />
                </ProtectedRoute>
              } />
              <Route path="/user/fir/my-fir-details/:id" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MyFIRDetails />
                </ProtectedRoute>
              } />
              <Route path="/user/fir/fir-records" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <FIRRecords />
                </ProtectedRoute>
              } />
              <Route path="/user/fir/fir-details/:id" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <FIRDetails />
                </ProtectedRoute>
              } />
              <Route path="/user/pages/safety-tips" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <SafetyTips />
                </ProtectedRoute>
              } />
              <Route path="/user/pages/about" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <About />
                </ProtectedRoute>
              } />
              <Route path="/user/pages/contact" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Contact />
                </ProtectedRoute>
              } />
              <Route path="/user/pages/profile" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/user/pages/privacy-policy" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <PrivacyPolicy />
                </ProtectedRoute>
              } />
              <Route path="/user/pages/terms-of-service" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <TermsOfService />
                </ProtectedRoute>
              } />

              {/* Admin Protected Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/fir/manage" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageFIRs />
                </ProtectedRoute>
              } />
              <Route path="/admin/fir/details/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFIRDetails />
                </ProtectedRoute>
              } />
              <Route path="/admin/users/manage" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/messages" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ContactMessages />
                </ProtectedRoute>
              } />
              <Route path="/admin/tips/manage" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageTips />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SiteSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/profile" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProfile />
                </ProtectedRoute>
              } />
              <Route path="/admin/help" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Help />
                </ProtectedRoute>
              } />

              {/* Fallback to Root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <AppFooter />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
