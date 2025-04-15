import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import FilterForm from "../Filter/JobFilterForm";
import "./JobListDashboard.css";
import JobApplicationCard from "../Job/JobApplicationCard";
import Footer from "../Footer/Footer";


import { useNavigate } from "react-router-dom";

const JobListDashboard = () => {
    const [user, setUser] = useState(null);
    const [jobApplications, setJobApplications] = useState([]);
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
    });

    // Fetch data only once on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("jwtToken");
                
                // Make both API calls in parallel
                const [userResponse, jobsResponse] = await Promise.all([
                    fetch("/api/getUserDetails", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch("/api/listJobApplications", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({}),
                    })
                ]);
                
                if (!userResponse.ok) {
                    throw new Error("Failed to fetch user details");
                }
                
                if (!jobsResponse.ok) {
                    throw new Error("Failed to fetch job applications");
                }
                
                const userData = await userResponse.json();
                const jobsData = await jobsResponse.json();
                
                setUser(userData);
                setJobApplications(jobsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    // Function to fetch job applications with filters
    const fetchFilteredJobApplications = async (filterParams) => {
        setLoading(true);
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
            setJobApplications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

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
        fetchFilteredJobApplications(filterParams);
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
        });
        fetchFilteredJobApplications({});
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
                />

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
                                const isHired = application.applicants?.some(
                                    (applicant) => applicant.isHired
                                );

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
                                        isHired={isHired} // Pass it to your card if needed
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
