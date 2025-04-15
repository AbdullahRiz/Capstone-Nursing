import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

/**
 * Higher-order component that provides router props to class components (withRouter HOC)
 */
export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let navigate = useNavigate();
    let location = useLocation();
    let params = useParams();
    
    return (
      <Component
        {...props}
        navigate={navigate}
        location={location}
        params={params}
      />
    );
  }

  return ComponentWithRouterProp;
}
