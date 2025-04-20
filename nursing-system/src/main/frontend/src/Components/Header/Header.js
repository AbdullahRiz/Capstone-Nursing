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
            
            if (!token) {
                // If no token exists, just clean up and redirect
                setIsLoggedIn(false);
                setLogoutMessage("You have been logged out.");
                navigate("/");
                return;
            }
            
            try {
                // Try to call the logout API
                const response = await fetch("http://localhost:8080/api/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                });
                
                // Even if the API call fails, we still want to log out the user locally
                if (!response.ok) {
                    console.warn(`Logout API returned status: ${response.status}`);
                    // Check if it's a JWT error
                    try {
                        const errorData = await response.json();
                        if (errorData.message && errorData.message.includes('JWT')) {
                            console.log('JWT error detected during logout');
                        }
                    } catch (e) {
                        // If we can't parse the response as JSON, just continue with logout
                    }
                }
            } catch (apiError) {
                // If the API call throws an error, log it but continue with local logout
                console.error("Error calling logout API: ", apiError);
            }
            
            // Always clear the token and update state, regardless of API success
            localStorage.removeItem("jwtToken");
            setIsLoggedIn(false);
            setLogoutMessage("You have successfully logged out.");
            navigate("/");
            
        } catch (error) {
            console.error("Error during logout process: ", error);
            
            // Even if there's an error, make sure the user is logged out locally
            localStorage.removeItem("jwtToken");
            setIsLoggedIn(false);
            setLogoutMessage("Logged out with errors.");
            navigate("/");
        }

        // Remove logout message after a short delay
        setTimeout(() => {
            setLogoutMessage("");
        }, 800);
    };

    return (
        <header className="header">
            <nav className="navbar navbar-expand-lg">
                <Link className="navbar-brand" to="/">
                    🏥 Health Bridge
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
