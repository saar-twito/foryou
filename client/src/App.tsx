import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import CustomerCatalog from './pages/CustomerCatalog/CustomerCatalog';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login/Login';
import NavigationBar from './components/NavigationBar/NavigationBar';

const AppContent = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <NavigationBar
        onLoginClick={() => setShowLogin(true)}
        onLogoutClick={handleLogout}
      />

      <Routes>
        <Route index element={<CustomerCatalog />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="product/:id" element={<ProductDetails />} />
      </Routes>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
