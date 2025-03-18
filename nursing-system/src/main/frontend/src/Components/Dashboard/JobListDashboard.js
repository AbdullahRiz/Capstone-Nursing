import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import FilterForm from "../Filter/JobFilterForm";
import "./JobListDashboard.css";
import JobApplicationCard from "../Job/JobApplicationCard";
import Footer from "../Footer/Footer";

const JobListDashboard = () => {
    const [user, setUser] = useState(null)
    const [jobApplications, setJobApplications] = useState([]);
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(null); // State to handle errors

    // State for filters
    const [filters, setFilters] = useState({
        skillSet: "",
        minimumHours: "",
        maximumHours: "",
        hospitalId: "",
        startDate: "",
        endDate: "",
        minPay: "",
        maxPay: "",
    });

    // Fetch job applications from the API
    const fetchJobApplications = async (filterParams) => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("/api/listJobApplications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(filterParams),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch job applications");
            }

            const data = await response.json();
            setJobApplications(data); // Set the fetched job applications
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    // Fetch job applications on initial render
    useEffect(() => {
        fetchJobApplications({}); // Fetch all job applications initially
    }, []);

    useEffect(() => {
        fetchUserDetails()
    }, [])

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    // Handle filter submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const filterParams = {
            skillSet: filters.skillSet ? [filters.skillSet] : [],
            minimumHours: filters.minimumHours ? parseFloat(filters.minimumHours) : null,
            maximumHours: filters.maximumHours ? parseFloat(filters.maximumHours) : null,
            hospitalId: filters.hospitalId || null,
            startDate: filters.startDate ? new Date(filters.startDate).toISOString() : null,
            endDate: filters.endDate ? new Date(filters.endDate).toISOString() : null,
            minPay: filters.minPay ? parseFloat(filters.minPay) : null,
            maxPay: filters.maxPay ? parseFloat(filters.maxPay) : null,
        };
        fetchJobApplications(filterParams); // Fetch job applications with filters
    };

    // Handle filter reset
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
        });
        fetchJobApplications({}); // Fetch all job applications again
    };

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
                {/* Filter Form Component */}
                <FilterForm
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                />

                {/* Main Content */}
                <main className="main-content">
                    <header className="dashboard-header">
                        <div>
                            <h1>Job Applications</h1>
                            <p>Hello, {user.name || "Guest"}</p>
                        </div>

                    </header>

                    <div className="applications-grid">
                        {jobApplications.length > 0 ? (
                            jobApplications.map((application) => {
                                const updatedAt = application.updatedAt
                                    ? format(new Date(application.updatedAt), "MM/dd/yyyy")
                                    : "No last update available";

                                const targetDate = application.hiringGoal?.targetDate
                                    ? format(new Date(application.hiringGoal.targetDate), "MM/dd/yyyy")
                                    : "No target date set";
                                
                                return (
                                    <JobApplicationCard
                                        key={application.id}
                                        id={application.id}
                                        applicants={application.applicants.length}
                                        updatedAt={updatedAt}
                                        targetDate={targetDate}
                                        title={application.jobTitle}
                                    />
                                );
                            })
                        ) : (
                            <p>No job applications found.</p>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default JobListDashboard;