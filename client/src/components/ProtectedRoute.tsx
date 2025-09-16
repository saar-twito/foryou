import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Login Required</h2>
        <p>You need to login to access this page.</p>
        <Link to="/">← Back to Catalog</Link>
      </div>
    );
  }

  // Logged in but not admin
  if (user.role !== 'admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
        <Link to="/">← Back to Catalog</Link>
      </div>
    );
  }

  // User is admin - show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;