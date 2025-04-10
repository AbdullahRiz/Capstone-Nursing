import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FilterForm from "../Filter/NurseFilterForm";
import NurseItem from "../Nurse/NurseItem";
import "./JobDetail.css";
import Footer from "../Footer/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const JobDetail = () => {
    const { id } = useParams(); // Get the job ID from the URL
    const [job, setJob] = useState(null); // State to store job details
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(null); // State to handle errors
    const [isAuthor, setIsAuthor] = useState(false); // State to check if the current user is the author
    const [isNurse, setIsNurse] = useState(false); // State to check if the current user is a nurse
    const [showApplyModal, setShowApplyModal] = useState(false); // State to control the apply modal
    const [hasApplied, setHasApplied] = useState(false); // State to check if the nurse has already applied
    const [currentUserId, setCurrentUserId] = useState(null); // State to store the current user's ID
    
    // State for application form
    const [applicationData, setApplicationData] = useState({
        availableDays: [],
        availableHours: "",
        skills: []
    });
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState(null);
    const [applySuccess, setApplySuccess] = useState(false);

    // State for filters
    const [filters, setFilters] = useState({
        skill: "",
        hoursAvailable: "",
    });

    // Fetch job details and user details in parallel
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("jwtToken");
                
                // Fetch job details and user details in parallel
                const [jobResponse, userResponse] = await Promise.all([
                    fetch(`/api/jobApplication/${id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch("/api/getUserDetails", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    })
                ]);
                
                if (!jobResponse.ok) {
                    throw new Error("Failed to fetch job details");
                }
                
                if (!userResponse.ok) {
                    throw new Error("Failed to fetch user details");
                }
                
                // Parse responses
                const jobData = await jobResponse.json();
                const userData = await userResponse.json();
                
                // Update state with job data
                setJob(jobData);
                
                // Store the current user's ID
                setCurrentUserId(userData.id);
                
                // Check if the current user is the author of the job
                if (userData.role === "HOSPITAL" && userData.id === jobData.hospitalId) {
                    setIsAuthor(true);
                }
                
                // Check if the current user is a nurse
                if (userData.role === "NURSE") {
                    setIsNurse(true);
                    
                    // Check if the nurse has already applied to this job
                    const hasAlreadyApplied = jobData.applicants.some(
                        applicant => applicant.applicantId === userData.id
                    );
                    setHasApplied(hasAlreadyApplied);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    // Handle day selection for application
    const handleDaySelection = (day) => {
        if (applicationData.availableDays.includes(day)) {
            setApplicationData({
                ...applicationData,
                availableDays: applicationData.availableDays.filter(d => d !== day)
            });
        } else {
            setApplicationData({
                ...applicationData,
                availableDays: [...applicationData.availableDays, day]
            });
        }
    };
    
    // Handle skill selection for application
    const handleSkillSelection = (skill) => {
        if (applicationData.skills.includes(skill)) {
            setApplicationData({
                ...applicationData,
                skills: applicationData.skills.filter(s => s !== skill)
            });
        } else {
            setApplicationData({
                ...applicationData,
                skills: [...applicationData.skills, skill]
            });
        }
    };
    
    // Handle hours input for application
    const handleHoursChange = (e) => {
        setApplicationData({
            ...applicationData,
            availableHours: e.target.value
        });
    };
    
    // Handle application submission
    const handleApply = async () => {
        setApplyLoading(true);
        setApplyError(null);
        
        try {
            const token = localStorage.getItem("jwtToken");
            
            const response = await fetch(`/api/jobApplication/${id}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    availableDays: applicationData.availableDays,
                    availableHours: parseFloat(applicationData.availableHours),
                    skills: applicationData.skills
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to apply for job");
            }
            
            setApplySuccess(true);
            setHasApplied(true);
            
            // Close the modal after 2 seconds
            setTimeout(() => {
                setShowApplyModal(false);
                setApplySuccess(false);
            }, 2000);
            
        } catch (err) {
            setApplyError(err.message);
        } finally {
            setApplyLoading(false);
        }
    };
    
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
                    
                    <div className="metadata-section">
                        <h2>Job Description</h2>
                        {job.description}
                    </div>
                    
                    <div className="metadata-grid">
                        <div className="metadata-section">
                            <h2>Required Skills</h2>
                            <div className="skills-tags">
                                {job.requiredSkills.map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                        {skill.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="metadata-section">
                            <h2>Job Details</h2>
                            <div className="detail-item">
                                <i className="bi bi-calendar-range"></i>
                                <span className="detail-label">Duration:</span>
                                <span className="detail-value">
                                    {new Date(job.startDate).toLocaleDateString()} - {new Date(job.endDate).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <div className="detail-item">
                                <i className="bi bi-cash"></i>
                                <span className="detail-label">Pay Range:</span>
                                <span className="detail-value">
                                    ${job.minPay.toFixed(2)} - ${job.maxPay.toFixed(2)} per hour
                                </span>
                            </div>
                            
                            {job.hiringGoal && (
                                <>
                                    {job.hiringGoal.targetHours && (
                                        <div className="detail-item">
                                            <i className="bi bi-clock"></i>
                                            <span className="detail-label">Target Hours:</span>
                                            <span className="detail-value">
                                                {job.hiringGoal.targetHours} hours per week
                                            </span>
                                        </div>
                                    )}
                                    
                                    {job.hiringGoal.targetDate && (
                                        <div className="detail-item">
                                            <i className="bi bi-calendar-check"></i>
                                            <span className="detail-label">Target Hiring Date:</span>
                                            <span className="detail-value">
                                                {new Date(job.hiringGoal.targetDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {job.hiringGoal.preferredSkills && job.hiringGoal.preferredSkills.length > 0 && (
                                        <div className="preferred-skills">
                                            <span className="detail-label">Preferred Skills:</span>
                                            <div className="skills-tags preferred">
                                                {job.hiringGoal.preferredSkills.map((skill, index) => (
                                                    <span key={index} className="skill-tag preferred">
                                                        {skill.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Apply button for nurses */}
                    {isNurse && !isAuthor && (
                        <div className="apply-section">
                            {hasApplied ? (
                                <div className="already-applied">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>You have already applied to this job</span>
                                </div>
                            ) : (
                                <button 
                                    className="apply-button"
                                    onClick={() => setShowApplyModal(true)}
                                >
                                    Apply for this Job
                                </button>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Apply Modal */}
                {showApplyModal && (
                    <div className="modal-overlay">
                        <div className="apply-modal">
                            <div className="modal-header">
                                <h2>Apply for {job.jobTitle}</h2>
                                <button 
                                    className="close-button"
                                    onClick={() => setShowApplyModal(false)}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            
                            {applySuccess ? (
                                <div className="success-message">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <p>Application submitted successfully!</p>
                                </div>
                            ) : (
                                <div className="modal-content">
                                    {applyError && (
                                        <div className="error-message">
                                            <i className="bi bi-exclamation-triangle-fill"></i>
                                            <p>{applyError}</p>
                                        </div>
                                    )}
                                    
                                    <div className="form-section">
                                        <h3>Available Days</h3>
                                        <p>Select the days you are available to work:</p>
                                        <div className="days-container">
                                            {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
                                                <div className="day-checkbox" key={day}>
                                                    <input
                                                        type="checkbox"
                                                        id={`day-${day}`}
                                                        checked={applicationData.availableDays.includes(day)}
                                                        onChange={() => handleDaySelection(day)}
                                                    />
                                                    <label htmlFor={`day-${day}`}>{day.charAt(0) + day.slice(1).toLowerCase()}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="form-section">
                                        <h3>Available Hours</h3>
                                        <p>Enter the number of hours you are available per week:</p>
                                        <input
                                            type="number"
                                            value={applicationData.availableHours}
                                            onChange={handleHoursChange}
                                            min="1"
                                            step="0.5"
                                            placeholder="Hours per week"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-section">
                                        <h3>Your Skills</h3>
                                        <p>Select the skills you have that match this job:</p>
                                        <div className="skills-container">
                                            {["PATIENT_CARE", "VITAL_SIGNS_MONITORING", "MEDICATION_ADMINISTRATION", 
                                              "IV_THERAPY", "WOUND_CARE", "INFECTION_CONTROL", 
                                              "DOCUMENTATION", "HEALTH_EDUCATION"].map((skill) => (
                                                <div className="skill-checkbox" key={skill}>
                                                    <input
                                                        type="checkbox"
                                                        id={`skill-${skill}`}
                                                        checked={applicationData.skills.includes(skill)}
                                                        onChange={() => handleSkillSelection(skill)}
                                                    />
                                                    <label htmlFor={`skill-${skill}`}>
                                                        {skill.replace(/_/g, ' ')}
                                                        {job.requiredSkills.includes(skill) && (
                                                            <span className="required-badge">Required</span>
                                                        )}
                                                        {job.hiringGoal?.preferredSkills?.includes(skill) && (
                                                            <span className="preferred-badge">Preferred</span>
                                                        )}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="modal-actions">
                                        <button 
                                            className="cancel-button"
                                            onClick={() => setShowApplyModal(false)}
                                            disabled={applyLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="submit-button"
                                            onClick={handleApply}
                                            disabled={applyLoading || 
                                                     applicationData.availableDays.length === 0 || 
                                                     !applicationData.availableHours || 
                                                     applicationData.skills.length === 0}
                                        >
                                            {applyLoading ? "Submitting..." : "Submit Application"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
