import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import FilterForm from "../Filter/JobFilterForm";
import "./JobListDashboard.css";
import JobApplicationCard from "../Job/JobApplicationCard";
import Footer from "../Footer/Footer";
import {useNavigate} from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const JobListDashboard = () => {
    const navigate = useNavigate()

    const [user, setUser] = useState(null);
    const [jobApplications, setJobApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locations, setLocations] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
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


    const getRecommendedJobs = () => {
        if (!user?.nurseDetails?.skillSet || user.nurseDetails.skillSet.length === 0) {
            return [];
        }

        const nurseSkills = user.nurseDetails.skillSet.map(skill => skill.toLowerCase());

        return jobApplications.filter((application) => {
            // Skip jobs that have hired applicants
            if (application.hired || application.applicants?.some(applicant => applicant.isHired)) {
                return false;
            }
            
            if (!application.requiredSkills || application.requiredSkills.length === 0) {
                return false;
            }

            const jobSkills = application.requiredSkills.map(skill => skill.toLowerCase());
            const matchingSkills = nurseSkills.filter(skill => jobSkills.includes(skill));
            const matchPercentage = (matchingSkills.length / jobSkills.length) * 100;

            return matchPercentage >= 30; // Only recommend if >= 30% match
        });
    };

    // Filter jobs based on search term
    const filterJobsBySearchTerm = (jobs) => {
        if (!searchTerm.trim()) return jobs;
        
        return jobs.filter(job => 
            job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };



    // Fetch data only once on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("jwtToken");

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
                    }),
                ]);

                if (!userResponse.ok) {
                    localStorage.removeItem("jwtToken");
                    navigate("/signin");
                    return;
                }

                if (!jobsResponse.ok) {
                    throw new Error("Failed to fetch job applications");
                }

                const userData = await userResponse.json();
                const jobsData = await jobsResponse.json();

                setUser(userData);
                setJobApplications(jobsData);

                console.log("User SkillSet:", userData?.nurseDetails?.skillSet);

            } catch (err) {
                console.error("Error during fetchData:", err);
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
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search by job title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <FaSearch className="search-icon" />
                            </div>
                        </div>
                    </header>

                    <div className="recommended-jobs-section">
                        {filterJobsBySearchTerm(getRecommendedJobs()).length > 0 ? (
                            <>
                                <h2>Recommended for You</h2>
                                <div className="applications-grid">
                                    {filterJobsBySearchTerm(getRecommendedJobs()).map((application) => {
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
                                                description={application.description}
                                                isHired={application.applicants?.some(applicant => applicant.isHired)}
                                                userRole={user.role}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>Recommended for You</h2>
                                <p>
                                    No recommended jobs for your profile,&nbsp;<strong>Don't worry, you can still apply for the other jobs as well.</strong>
                                </p>
                            </>
                        )}
                    </div>

                    <hr />

                    <div className="all-jobs-section">
                        <h2>All Job Applications</h2>
                        <div className="applications-grid">
                            {jobApplications.length > 0 ? (
                                filterJobsBySearchTerm(jobApplications)
                                    .filter(application => {
                                        // For nurses, don't show hired jobs
                                        if (user.role === "NURSE" && (application.hired || application.applicants?.some(applicant => applicant.isHired))) {
                                            return false;
                                        }
                                        // For hospitals, show all jobs
                                        return !application.hired;
                                    })
                                    .map((application) => {
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
                                                description={application.description}
                                                isHired={application.applicants?.some(applicant => applicant.isHired)}
                                                userRole={user.role}
                                            />
                                        );
                                    })
                            ) : (
                                <p>No job applications found.</p>
                            )}
                        </div>
                    </div>


                </main>
            </div>
            <Footer />
        </>
    );
};

export default JobListDashboard;
