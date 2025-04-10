import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FilterForm from "../Filter/NurseFilterForm";
import NurseItem from "../Nurse/NurseItem";
import "./JobDetail.css";
import Footer from "../Footer/Footer";

const JobDetail = () => {
    const { id } = useParams(); // Get the job ID from the URL
    const [job, setJob] = useState(null); // State to store job details
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(null); // State to handle errors
    const [isAuthor, setIsAuthor] = useState(false); // State to check if the current user is the author

    // State for filters
    const [filters, setFilters] = useState({
        skill: "",
        hoursAvailable: "",
    });

    // Fetch job details from the API
    const fetchJobDetails = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(`/api/jobApplication/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch job details");
            }

            const data = await response.json();
            setJob(data); // Set the fetched job details

            // Fetch the current user's details
            const userResponse = await fetch("/api/getUserDetails", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error("Failed to fetch user details");
            }

            const user = await userResponse.json();

            // Check if the current user is the author of the job
            if (user.role === "HOSPITAL" && user.id === data.hospitalId) {
                setIsAuthor(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch job details on initial render
    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    // Filter applicants based on skill and hours available
    const filteredApplicants = job?.applicants?.filter((nurse) => {
        return (
            (!filters.skill || nurse.skills.includes(filters.skill)) &&
            (!filters.hoursAvailable || nurse.availableHours >= parseFloat(filters.hoursAvailable))
        );
    }) || [];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleReset = () => {
        setFilters({
            skill: "",
            hoursAvailable: "",
        });
    };

    // Display loading state
    if (loading) {
        return <p>Loading...</p>;
    }

    // Display error state
    if (error) {
        return <p>Error: {error}</p>;
    }

    // Display if no job details are found
    if (!job) {
        return <p>No job details found.</p>;
    }

    return (
        <>
            <div className="job-detail-container">
                {/* Job Metadata */}
                <div className="job-metadata">
                    <h1>{job.jobTitle}</h1>
                    <p><strong>Description:</strong> {job.description}</p>
                    <p><strong>Required Skills:</strong> {job.requiredSkills.join(", ")}</p>
                    <p><strong>Start Date:</strong> {job.startDate}</p>
                    <p><strong>End Date:</strong> {job.endDate}</p>
                    <p><strong>Min Pay:</strong> ${job.minPay}</p>
                    <p><strong>Max Pay:</strong> ${job.maxPay}</p>
                </div>

                {/* Render applicants and filter only if the current user is the author */}
                {isAuthor && (
                    <div className="job-admin-view">
                        {/* Filter Sidebar */}
                        <aside className="filter-sidebar">
                            <h3>Filter Applicants</h3>
                            <FilterForm
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={handleReset}
                            />
                        </aside>

                        {/* Applicants List */}
                        <div className="applicants-list">
                            <h2>Applicants</h2>
                            {filteredApplicants.length > 0 ? (
                                filteredApplicants.map((nurse) => (
                                    <NurseItem
                                        key={nurse.applicantId}
                                        nurse={nurse}
                                        job={job}
                                    />
                                ))
                            ) : (
                                <p>No applicants match the filters.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Footer/>
        </>
    );
};


export default JobDetail;
