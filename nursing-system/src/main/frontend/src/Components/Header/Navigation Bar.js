import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import TravlingNurse from "../Dashboard/TravelingNurse";

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTravelNurse, setIsTravelNurse] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    setIsLoggedIn(token !== null);

    if (token) {
      fetchUserDetails(token);
    }
  }, []);

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
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/jobListDashboard">
                    Jobs
                  </Link>
                </li>

                {isTravelNurse && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/TravlingNurse">
                        Traveling Nurse
                      </Link>
                    </li>
                )}
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