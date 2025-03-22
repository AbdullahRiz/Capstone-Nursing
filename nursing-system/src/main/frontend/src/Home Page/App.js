import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
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
import NurseListDashboard from "../Components/Dashboard/NurseListDashboard";


const AppContent = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <>
            {location.pathname !== "/dummy" && <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/dummy" element={<Dummy isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/jobListDashboard" element={<JobListDashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/nurseListDashboard" element={<NurseListDashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/job/:id" element={<JobDetail />} />
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