import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HealthTracker from './pages/HealthTracker';
import Quiz from './components/Quiz/Quiz';
import UserDetails from './components/UserDetails';

// Create a wrapper component that uses the Auth context
const ProtectedRoutes = () => {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoutes />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="settings" element={<Settings />} />
              <Route path="health-tracker" element={<HealthTracker />} />
              <Route path="assessment" element={<Quiz />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
