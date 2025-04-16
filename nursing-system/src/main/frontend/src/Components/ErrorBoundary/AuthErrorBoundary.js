import React, { Component } from 'react';
import { withRouter } from './withRouter';

/**
 * Error boundary component that catches authentication errors
 * and redirects to the login page
 */
class AuthErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  // https://react.dev/reference/react/Component#componentdidcatch
  componentDidCatch(error, errorInfo) {
    // Check if the error is related to JWT validation
    const isAuthError = 
      (error.message && error.message.includes('JWT')) || 
      (error.response?.data?.message && error.response.data.message.includes('JWT')) ||
      error.response?.status >= 400;
    
    if (isAuthError) {
      console.log('Authentication error detected in error boundary, redirecting to login');
      localStorage.removeItem('jwtToken');
      this.props.navigate('/signin');
    }
    
    // Log the error for debugging
    console.error("Auth error found in error boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.errorInfo?.componentStack || '';
      const isAuthError = errorMessage.includes('JWT') || 
                          errorMessage.includes('Authentication') || 
                          errorMessage.includes('token');
      
      if (isAuthError) {
        return <div>Redirecting to login...</div>;
      }
    }

    return this.props.children;
  }
}

export default withRouter(AuthErrorBoundary);
