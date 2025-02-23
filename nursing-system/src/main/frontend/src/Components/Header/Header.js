import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Header.css";
import Navigation from "./Navigation Bar";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [logoutMessage, setLogoutMessage] = useState("");

    const handleLogout = () => {
        // Clear authentication tokens or session data
        localStorage.removeItem("authToken");

        // Update the isLoggedIn state
        setIsLoggedIn(false);

        // Set logout message
        setLogoutMessage("You have successfully logged out.");

        // Redirect to the Home page
        navigate("/");

        // Remove logout message after 3 seconds
        setTimeout(() => {
            setLogoutMessage("");
        }, 800);
    };

    return (
        <header className="header">
            <nav className="navbar navbar-expand-lg">
                <Link className="navbar-brand" to="/">
                    🏥 Nursing Group
                </Link>
                <Navigation />
                <ul className="navbar-nav ml-auto">
                    {isLoggedIn || location.pathname === "/Dummy" ? (
                        <li className="nav-item">
                            <button className="nav-link account-link" onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    ) : (
                        <li className="nav-item">
                            <Link className="nav-link account-link" to="/signin">
                                <i className="bi bi-person-circle"></i>
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
            {logoutMessage && <div className="alert alert-success">{logoutMessage}</div>}
        </header>
    );
};

export default Header;