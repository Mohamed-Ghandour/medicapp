import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { DoctorsList } from './pages/patient/DoctorsList';
import { DoctorAvailability } from './pages/patient/DoctorAvailability';
import { Appointments } from './pages/shared/Appointments';
import { Statistics } from './pages/shared/Statistics';
import { ManageAvailability } from './pages/doctor/ManageAvailability';
import { DoctorOverview } from './pages/doctor/DoctorOverview';
import { MyDossier } from './pages/patient/MyDossier';
import { UserManagement } from './pages/admin/UserManagement';
import { CreateDoctor } from './pages/admin/CreateDoctor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />

            {/* Shared routes — available to all authenticated users */}
            <Route path="appointments" element={<Appointments />} />
            <Route path="statistics" element={<Statistics />} />

            {/* Patient routes */}
            <Route path="doctors" element={<ProtectedRoute allowedRoles={['PATIENT']}><DoctorsList /></ProtectedRoute>} />
            <Route path="doctors/:id/availability" element={<ProtectedRoute allowedRoles={['PATIENT']}><DoctorAvailability /></ProtectedRoute>} />
            <Route path="dossier" element={<ProtectedRoute allowedRoles={['PATIENT']}><MyDossier /></ProtectedRoute>} />

            {/* Doctor routes */}
            <Route path="doctor/overview" element={<ProtectedRoute allowedRoles={['MEDECIN']}><DoctorOverview /></ProtectedRoute>} />
            <Route path="availability" element={<ProtectedRoute allowedRoles={['MEDECIN']}><ManageAvailability /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
            <Route path="admin/create-doctor" element={<ProtectedRoute allowedRoles={['ADMIN']}><CreateDoctor /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
