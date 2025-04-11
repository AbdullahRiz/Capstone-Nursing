import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "../Home/Home";
import { Link } from "react-router-dom";

const Navigation = () => {
  // Check if user is logged in without making API calls
  const isLoggedIn = localStorage.getItem("jwtToken") !== null;
  return (
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            Home
          </Link>
        </li>
        {isLoggedIn && (
          <>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/dashboard"
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/jobListDashboard"
              >
                Jobs
              </Link>
            </li>
          </>
        )}
        <li className="nav-item">
          <Link className="nav-link" to="/about">
            About
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/services">
            Services
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/contact">
            Contact
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navigation;
