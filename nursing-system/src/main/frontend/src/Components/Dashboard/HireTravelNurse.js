import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import FilterForm from "../Filter/JobFilterForm";
import "./JobListDashboard.css"; // Keep using the same CSS file
import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom";

const HireTravelNurse = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [travelNurses, setTravelNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        skillSet: "",
        minimumHours: "",
        maximumHours: "",
        hospitalId: "",
        startDate: "",
        endDate: "",
        minPay: "",
        maxPay: "",
        locations: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("jwtToken");

                const userResponse = await fetch("/api/getUserDetails", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!userResponse.ok) {
                    localStorage.removeItem("jwtToken");
                    navigate("/signin");
                    return;
                }

                const userData = await userResponse.json();
                setUser(userData);

                if (userData.role !== "nurse") {
                    const travelResponse = await fetch("/api/getTravelNurses", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (travelResponse.ok) {
                        const travelNursesData = await travelResponse.json();
                        setTravelNurses(travelNursesData);
                    } else {
                        console.error("Failed to fetch traveling nurses");
                    }
                }
            } catch (err) {
                console.error("Error during fetchData:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleFilterChange = (e) => {
        const { name, value, type } = e.target;
        if (type === "select-multiple") {
            const selected = Array.from(e.target.selectedOptions, (option) => option.value);
            setFilters((prevFilters) => ({
                ...prevFilters,
                [name]: selected,
            }));
        } else {
            setFilters((prevFilters) => ({
                ...prevFilters,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Optional: Add filtering if needed
    };

    const handleReset = () => {
        setFilters({
            skillSet: "",
            minimumHours: "",
            maximumHours: "",
            hospitalId: "",
            startDate: "",
            endDate: "",
            minPay: "",
            maxPay: "",
            locations: [],
        });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!user) return <p>Loading user info...</p>;

    return (
        <>
            <div className="dashboard-container">
                <FilterForm
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    travelModeOn={user?.nurseDetails?.isTravelNurse}
                    availableLocations={[]} // No location filtering yet
                />

                <main className="main-content">
                    <header className="dashboard-header">
                        <div>
                            <h1>Hire Traveling Nurses</h1>
                            <p>Hello, <strong>{user.name || "Guest"}</strong></p>
                        </div>
                    </header>

                    {travelNurses.length > 0 ? (
                        <>
                            <h2>Available Traveling Nurses</h2>
                            <div className="applications-grid">
                                {travelNurses.map((nurse) => (
                                    <div key={nurse.id} className="job-application-card">
                                        <div className="card-title">{nurse.name}</div>

                                        <div className="card-info">
                                            <div className="info-block">
                                                <strong>Experience:</strong> {nurse.experience || 0} years
                                            </div>
                                            <div className="info-block">
                                                <strong>Skills:</strong> {nurse.skillSet?.join(", ") || "Not specified"}
                                            </div>
                                            <div className="info-block">
                                                <strong>Available From:</strong> {format(new Date(), "MM/dd/yyyy")}
                                            </div>
                                        </div>

                                        <div className="card-buttons">
                                            <button className="hire-button">Hire Now</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>No traveling nurses available at the moment.</p>
                    )}
                </main>
            </div>
            <Footer />
        </>
    );
};

export default HireTravelNurse;