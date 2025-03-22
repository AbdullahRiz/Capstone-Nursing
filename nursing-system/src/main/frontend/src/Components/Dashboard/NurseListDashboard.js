import React, { useEffect, useState } from "react";
import "./JobListDashboard.css"; // Create a new CSS file for the nurse dashboard
import Footer from "../Footer/Footer";

const NurseListDashboard = () => {
    const [user, setUser] = useState(null); // State to store the current user
    const [nurses, setNurses] = useState([]); // State to store the list of nurses
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(null); // State to handle errors

    // Fetch nurses from the API
    const fetchNurses = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("/api/searchNurses", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            // Log the response status and text for debugging
            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Failed to fetch nurses: ${response.statusText}`);
            }

            // Parse the response as a JSON list
            const data = JSON.parse(responseText);
            if (!Array.isArray(data)) {
                throw new Error("Expected a list of nurses, but received invalid data");
            }

            setNurses(data); // Set the fetched nurses
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch current user details
    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("/api/getUserDetails", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("User not found");
                } else if (response.status === 403) {
                    throw new Error("Access forbidden");
                } else {
                    throw new Error("Failed to fetch user details");
                }
            }

            const user = await response.json();
            setUser(user);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fetch nurses and user details on initial render
    useEffect(() => {
        fetchNurses(); // Fetch all nurses initially
        fetchUserDetails(); // Fetch current user details
    }, []);

    // Display loading state
    if (loading) {
        return <p>Loading...</p>;
    }

    // Display error state
    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            <div className="dashboard-container">
                {/* Main Content */}
                <main className="main-content">
                    <header className="dashboard-header">
                        <h1>Nurses</h1>
                        <p>Hello, {user?.name || "User"}</p>
                    </header>

                    {/* Needs reworking here */}
                    <ul>
                        {nurses.map((nurse) => (
                            <li key={nurse.id}>{nurse.name} - {nurse.role}</li>
                        ))}
                    </ul>


                </main>
            </div>
            <Footer/>
        </>
    );
};

export default NurseListDashboard;