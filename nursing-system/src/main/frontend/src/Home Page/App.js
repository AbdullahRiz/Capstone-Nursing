import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "../Components/Auth/ProtectedRoute";
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
import ContractsPage from "../Components/Contracts/ContractsPage";
import TravlingNurse from "../Components/Dashboard/TravelingNurse";
import HireTravelNurse from "../Components/Dashboard/HireTravelNurse";


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
                    // console.log("User Role fetched from API:", userData.role);
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

    // console.log("UserRole for redirection:", userRole);
    if (userRole === "NURSE") {
        return <Navigate to="/nurseDashboard" />;
    } else if (userRole === "HOSPITAL") {
        return <Navigate to="/hospitalDashboard" />;
    } else if (userRole === "INDIVIDUAL") {
        return <Navigate to="/HireTravelNurse" />;
    } else {
        // Default fallback
        return <Navigate to="/jobListDashboard" />;
    }
};

const AppContent = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <>
            {location.pathname !== "/dummy" && <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin setIsLoggedIn={setIsLoggedIn} />} />
                
                {/* Protected routes */}
                <Route path="/dummy" element={
                    <ProtectedRoute>
                        <Dummy isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardRedirect />
                    </ProtectedRoute>
                } />
                <Route path="/jobListDashboard" element={
                    <ProtectedRoute>
                        <JobListDashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                    </ProtectedRoute>
                } />
                <Route path="/nurseDashboard" element={
                    <ProtectedRoute>
                        <NurseDashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                    </ProtectedRoute>
                } />
                <Route path="/hospitalDashboard" element={
                    <ProtectedRoute>
                        <HospitalDashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                    </ProtectedRoute>
                } />
                <Route path="/create-job-application" element={
                    <ProtectedRoute>
                        <CreateJobApplication />
                    </ProtectedRoute>
                } />
                <Route path="/job/:id" element={
                    <ProtectedRoute>
                        <JobDetail />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/contracts" element={
                    <ProtectedRoute>
                        <ContractsPage />
                    </ProtectedRoute>
                } />
                <Route path="/TravlingNurse" element={
                    <ProtectedRoute>
                        <TravlingNurse />
                    </ProtectedRoute>
                } />
                <Route path="/HireTravelNurse" element={
                    <ProtectedRoute>
                        <HireTravelNurse />
                    </ProtectedRoute>
                } />
                
                {/* Catch-all route - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
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
