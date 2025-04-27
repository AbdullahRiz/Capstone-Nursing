import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTravelNurse, setIsTravelNurse] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();

  // Function to fetch user details
  const fetchUserDetails = async (token) => {
    try {
      const response = await fetch("/api/getUserDetails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);

        if (userData?.nurseDetails?.isTravelNurse) {
          setIsTravelNurse(true);
        } else {
          setIsTravelNurse(false);
        }
      } else {
        console.error("Failed to fetch user details for travel nurse status.");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("jwtToken");
      setIsLoggedIn(token !== null);

      if (token) {
        fetchUserDetails(token);
      } else {
        setUserRole(null);
        setIsTravelNurse(false);
      }
    };

    // Initial check
    checkLoginStatus();

    // Listen for storage events (login/logout)
    window.addEventListener("storage", checkLoginStatus);

    // Cleanup listener
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  return (
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">

          <li className="nav-item">
            <Link className="nav-link" to="/">Home</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/about">About</Link>
          </li>

          {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/jobListDashboard">
                    Jobs
                  </Link>
                </li>


                {/* If Nurse */}
                {userRole === "NURSE" && isTravelNurse && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/TravlingNurse">
                        Traveling Nurse
                      </Link>
                    </li>
                )}

                {/* If Hospital / Individual */}
                { userRole === "INDIVIDUAL"&& (
                    <li className="nav-item">
                      <Link className="nav-link" to="/HireTravelNurse">
                        Travel Nurse's
                      </Link>
                    </li>
                )}

              </>
          )}


          <li className="nav-item">
            <Link className="nav-link" to="/services">Services</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/contact">Contact</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/Profile">Profile</Link>
          </li>

        </ul>
      </div>
  );
};

export default Navigation;