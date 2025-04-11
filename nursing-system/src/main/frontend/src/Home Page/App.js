import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import Header from "../Components/Header/Header";
import Home from "../Components/Home/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Signup from "../Components/Signup/signup";
import Signin from "../Components/Signin/Signin";
import Dummy from "../Components/Home/Dummy";
import Footer from "../Components/Footer/Footer";
import JobListDashboard from "../Components/Dashboard/JobListDashboard";
import JobDetail from "../Components/Job/JobDetail";
import NurseDashboard from "../Components/Dashboard/NurseDashboard";
import HospitalDashboard from "../Components/Dashboard/HospitalDashboard";
import CreateJobApplication from "../Components/Job/CreateJobApplication";
import Profile from "../Components/Profile/Profile";


// Dashboard redirect component
const DashboardRedirect = () => {
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                if (!token) {
                    // If not logged in, redirect to signin
                    setLoading(false);
                    return;
                }
                
                const response = await fetch("http://localhost:8080/api/getUserDetails", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    setUserRole(userData.role);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user role:", error);
                setLoading(false);
            }
        };
        
        fetchUserRole();
    }, []);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!localStorage.getItem("jwtToken")) {
        return <Navigate to="/signin" />;
    }
    
    if (userRole === "NURSE") {
        return <Navigate to="/nurseDashboard" />;
    } else if (userRole === "HOSPITAL") {
        return <Navigate to="/hospitalDashboard" />;
    } else {
        // Default fallback
        return <Navigate to="/jobListDashboard" />;
    }
};

const AppContent = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // Check if user is logged in on component mount
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <>
            {location.pathname !== "/dummy" && <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/dummy" element={<Dummy isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/jobListDashboard" element={<JobListDashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/nurseDashboard" element={<NurseDashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/hospitalDashboard" element={<HospitalDashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/create-job-application" element={<CreateJobApplication />} />
                <Route path="/job/:id" element={<JobDetail />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
