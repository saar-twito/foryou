import { useState } from 'react';
import { Routes, Route, Link } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import CustomerCatalog from './pages/CustomerCatalog/CustomerCatalog';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login/Login';

const AppContent = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      {/* Simple Header */}
      <header style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Product Store
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/">Catalog</Link>

          {user && user.role === 'admin' && (
            <Link to="/admin">Admin Dashboard</Link>
          )}

          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Hello, {user.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)}>Login</button>
          )}
        </div>
      </header>

      {/* Main Content */}
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

      {/* Login Modal */}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}
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