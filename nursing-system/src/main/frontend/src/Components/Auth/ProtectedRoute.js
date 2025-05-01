import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * A wrapper component that protects routes requiring authentication
 * If the user is not authenticated, they will be redirected to the signin page
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render if authenticated
 * @returns {React.ReactNode} - The protected route or redirect
 */
const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }
        
        // Verify the token is valid by making a request to the API
        const response = await fetch('/api/getUserDetails', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          console.log('Token validation failed, removing token');
          localStorage.removeItem('jwtToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error validating authentication:', error);
        localStorage.removeItem('jwtToken');
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuthentication();
  }, []);
  
  if (isChecking) {
    // Show loading state while checking authentication
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to signin page with the return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the protected route
  return children;
};

export default ProtectedRoute;
