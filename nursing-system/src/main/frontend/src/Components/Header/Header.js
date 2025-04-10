import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Header.css";
import Navigation from "./Navigation Bar";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [logoutMessage, setLogoutMessage] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = async() => {

        try {
            const token = localStorage.getItem("jwtToken");
            console.log(token)

            const response = await fetch("http://localhost:8080/api/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            // Clear authentication tokens or session data
            localStorage.removeItem("jwtToken");

            // Update the isLoggedIn state
            setIsLoggedIn(false);

            // Set logout message
            setLogoutMessage("You have successfully logged out.");

            // Redirect to the Home page
            navigate("/");

        } catch (error) {
            console.error("Error during logout: ", error);
            setLogoutMessage("Logout failed.");
        }

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
                    {isLoggedIn ? (
                        <li className="nav-item dropdown-container" ref={dropdownRef}>
                            <button 
                                className="nav-link account-link profile-button" 
                                onClick={toggleDropdown}
                            >
                                <i className="bi bi-person-circle"></i>
                            </button>
                            <div className={`profile-dropdown ${dropdownOpen ? 'show' : ''}`}>
                                <Link 
                                    className="dropdown-item" 
                                    to="/profile" 
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <i className="bi bi-person"></i> My Profile
                                </Link>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        handleLogout();
                                    }}
                                >
                                    <i className="bi bi-box-arrow-right"></i> Logout
                                </button>
                            </div>
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
