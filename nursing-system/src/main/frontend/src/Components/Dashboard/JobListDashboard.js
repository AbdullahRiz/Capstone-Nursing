import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import FilterForm from "../Filter/JobFilterForm";
import "./JobListDashboard.css";
import JobApplicationCard from "../Job/JobApplicationCard";
import Footer from "../Footer/Footer";

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

    const [fieldErrors, setFieldErrors] = useState({
        minimumHours: "",
        maximumHours: "",
        minPay: "",
        maxPay: "",
    });

    const fetchJobApplications = async (filterParams) => {
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

    const fetchUserDetails = async () => {
        setLoading(true);
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
        setLoading(false);
    };

    useEffect(() => {
        fetchJobApplications({});
    }, []);

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));

        setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const min = parseFloat(filters.minimumHours);
        const max = parseFloat(filters.maximumHours);
        const minPay = parseFloat(filters.minPay);
        const maxPay = parseFloat(filters.maxPay);

        let minHours = !isNaN(min) && min >= 0 ? min : null;
        let maxHours = !isNaN(max) && max >= 0 ? max : null;
        let payMin = !isNaN(minPay) && minPay >= 0 ? minPay : null;
        let payMax = !isNaN(maxPay) && maxPay >= 0 ? maxPay : null;

        const newErrors = {
            minimumHours: "",
            maximumHours: "",
            minPay: "",
            maxPay: "",
        };

        if (filters.minimumHours !== "" && minHours === null) {
            newErrors.minimumHours = "Minimum hours must be a non-negative number.";
        }

        if (filters.maximumHours !== "" && maxHours === null) {
            newErrors.maximumHours = "Maximum hours must be a non-negative number.";
        }

        if (minHours !== null && maxHours !== null && maxHours < minHours) {
            newErrors.maximumHours = "Maximum hours cannot be less than minimum hours.";
        }

        if (filters.minPay !== "" && payMin === null) {
            newErrors.minPay = "Minimum pay must be a non-negative number.";
        }

        if (filters.maxPay !== "" && payMax === null) {
            newErrors.maxPay = "Maximum pay must be a non-negative number.";
        }

        if (payMin !== null && payMax !== null && payMax < payMin) {
            newErrors.maxPay = "Maximum pay cannot be less than minimum pay.";
        }

        setFieldErrors(newErrors);

        if (Object.values(newErrors).some((msg) => msg !== "")) return;

        const filterParams = {
            skillSet: filters.skillSet ? [filters.skillSet] : [],
            minimumHours: minHours,
            maximumHours: maxHours,
            hospitalId: filters.hospitalId || null,
            startDate: filters.startDate ? new Date(filters.startDate).toISOString() : null,
            endDate: filters.endDate ? new Date(filters.endDate).toISOString() : null,
            minPay: payMin,
            maxPay: payMax,
        };

        fetchJobApplications(filterParams);
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

        setFieldErrors({
            minimumHours: "",
            maximumHours: "",
            minPay: "",
            maxPay: "",
        });

        fetchJobApplications({});
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("document", file);

        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("/api/uploadDocument", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload document");
            }

            alert("Document uploaded successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload document.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!user) return <p>Loading user...</p>;

    return (
        <>
            <div className="dashboard-container">
                <FilterForm
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    fieldErrors={fieldErrors}
                />

                <main className="main-content">
                    <header className="dashboard-header">
                        <div>
                            <h1>Job Applications</h1>
                            <p>Hello, {user.name || "Guest"}</p>
                        </div>
                    </header>

                    <div className="upload-section">
                        <label htmlFor="fileUpload" className="upload-button">
                            Upload Document
                            <input
                                type="file"
                                id="fileUpload"
                                onChange={handleFileUpload}
                                className="file-input"
                                accept=".pdf,.doc,.docx"
                            />
                        </label>
                    </div>

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
