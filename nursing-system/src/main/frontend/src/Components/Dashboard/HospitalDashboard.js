import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalDashboard.css";
import defaultProfilePicture from "../../Assets/user.png";
import Footer from "../Footer/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const HospitalDashboard = ({ isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jobOffers, setJobOffers] = useState([]);
    const [jobApplications, setJobApplications] = useState([]);
    const [nurses, setNurses] = useState([]);

    // Fetch data function
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("jwtToken");
            
            if (!token) {
                throw new Error("No authentication token found");
            }
            
            // Fetch user details
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
            
            // Check if user is a hospital
            if (userData.role !== "HOSPITAL") {
                // Redirect to appropriate dashboard based on role
                if (userData.role === "NURSE") {
                    navigate("/nurseDashboard");
                    return;
                } else {
                    navigate("/");
                    return;
                }
            }
            
            setUser(userData);
            
            // Fetch job offers created by this hospital
            try {
                const offersResponse = await fetch("/api/jobOffer", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (!offersResponse.ok) {
                    console.error("Failed to fetch job offers:", offersResponse.status);
                } else {
                    const offersData = await offersResponse.json();
                    // Filter offers to only show those created by this hospital
                    const hospitalOffers = offersData.filter(offer => offer.hospitalId === userData.id);
                    setJobOffers(hospitalOffers);
                }
            } catch (err) {
                console.error("Error fetching job offers:", err);
            }
            
            // Fetch job applications created by this hospital
            try {
                const applicationsResponse = await fetch("/api/listJobApplications", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        hospitalId: userData.id
                    }),
                });
                
                if (!applicationsResponse.ok) {
                    console.error("Failed to fetch job applications:", applicationsResponse.status);
                } else {
                    const applicationsData = await applicationsResponse.json();
                    setJobApplications(applicationsData);
                }
            } catch (err) {
                console.error("Error fetching job applications:", err);
            }
            
            // Fetch nurses
            try {
                const nursesResponse = await fetch("/api/searchNurses", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (!nursesResponse.ok) {
                    console.error("Failed to fetch nurses:", nursesResponse.status);
                } else {
                    const nursesData = await nursesResponse.json();
                    // Limit to 5 nurses
                    setNurses(nursesData.slice(0, 5));
                }
            } catch (err) {
                console.error("Error fetching nurses:", err);
            }
            
        } catch (err) {
            setError(err.message);
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Fetch all data on component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle creating a job offer
    const handleCreateJobOffer = (nurseId, jobApplicationId) => {
        navigate(`/create-job-offer?nurseId=${nurseId}&jobApplicationId=${jobApplicationId}`);
    };

    // Handle canceling a job offer
    const handleCancelJobOffer = async (offerId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            
            if (!token) {
                throw new Error("No authentication token found");
            }
            
            const response = await fetch(`/api/jobOffer/${offerId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "CANCELLED" }),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to cancel offer: ${response.status}`);
            }
            
            // Update the local state to reflect the change
            setJobOffers(prevOffers => 
                prevOffers.map(offer => 
                    offer.id === offerId ? { ...offer, status: "CANCELLED" } : offer
                )
            );
            
            // Show success message
            alert("Offer cancelled successfully!");
            
        } catch (error) {
            console.error("Error cancelling offer:", error);
            alert(`Failed to cancel offer: ${error.message}`);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <div className="hospital-dashboard-container">
                <div className="hospital-header">
                    <div className="hospital-profile">
                        <img
                            src={user?.profilePicture || defaultProfilePicture}
                            alt={user?.name || "Hospital"}
                            className="hospital-profile-picture"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultProfilePicture;
                            }}
                        />
                        <div className="hospital-info">
                            <h2>{user?.name || "Hospital"}</h2>
                            <p>{user?.email || "No email provided"}</p>
                            <button 
                                className="create-job-btn"
                                onClick={() => navigate("/create-job-application")}
                            >
                                Create New Job Application
                            </button>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="dashboard-section">
                        <h3>Job Applications ({jobApplications.length})</h3>
                        <div className="applications-list">
                            {jobApplications.length > 0 ? (
                                <ul className="application-list">
                                    {jobApplications.map((application) => (
                                        <li 
                                            key={application.id} 
                                            className="application-item"
                                            onClick={() => navigate(`/job/${application.id}`)}
                                        >
                                            <div className="application-header">
                                                <div className="application-title">{application.jobTitle}</div>
                                                    {application.minPay > 0 && application.maxPay > 0 && (
                                                        <div className="pay-range">
                                                            <i className="bi bi-cash"></i> ${application.minPay} - ${application.maxPay}/hr
                                                        </div>
                                                    )}
                                                    {/* <div className="application-date">
                                                        Created: {new Date(application.createdAt).toLocaleDateString()}
                                                    </div> */}
                                            </div>
                                            
                                            <div className="application-description">
                                                {application.description && application.description.length > 150 
                                                    ? `${application.description.substring(0, 150)}...` 
                                                    : application.description}
                                            </div>
                                            
                                            <div className="application-details">
                                                <div className="application-detail">
                                                    <span className="detail-label">Required Skills:</span>
                                                    <div className="skill-tags">
                                                        {application.requiredSkills && application.requiredSkills.map((skill, index) => (
                                                            <span key={index} className="skill-tag">
                                                                {skill.replace(/_/g, ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="application-detail">
                                                    <span className="detail-label">Applicants:</span>
                                                    <span className="applicant-count">
                                                        <i className="bi bi-people"></i> {application.applicants?.length || 0} applicants
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data-message">No job applications created yet.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="dashboard-section">
                        <h3>Job Offers ({jobOffers.length})</h3>
                        <div className="offers-list">
                            {jobOffers.length > 0 ? (
                                <ul className="offer-list">
                                    {jobOffers.map((offer) => (
                                        <li key={offer.id} className="offer-item">
                                            <div className="offer-header">
                                                <div className="offer-title">{offer.jobTitle}</div>
                                                <div className="offer-status">
                                                    Status: <span className={`status-${offer.status.toLowerCase()}`}>
                                                        {offer.status}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="offer-recipient">
                                                <span className="detail-label">Offered to:</span>
                                                <span className="nurse-name">{offer.nurseName || "Nurse"}</span>
                                            </div>
                                            
                                            <div className="offer-details">
                                                <div className="offer-detail">
                                                    <span className="detail-label">Pay Rate:</span>
                                                    <span className="offer-pay">${offer.rate}/hr</span>
                                                </div>
                                                
                                                <div className="offer-detail">
                                                    <span className="detail-label">Total Compensation:</span>
                                                    <span className="offer-total">${offer.totalComp}</span>
                                                </div>
                                                
                                                <div className="offer-detail">
                                                    <span className="detail-label">Hours:</span>
                                                    <span>{offer.hours} hrs/day</span>
                                                </div>
                                                
                                                <div className="offer-detail">
                                                    <span className="detail-label">Work Days:</span>
                                                    <div className="days-available">
                                                        {offer.days?.map((day, index) => (
                                                            <span key={index} className="day-tag">
                                                                {day.substring(0, 3)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {offer.message && (
                                                <div className="offer-message">
                                                    <span className="detail-label">Message:</span>
                                                    <p>{offer.message}</p>
                                                </div>
                                            )}
                                            
                                            {offer.status === "SENT" && (
                                                <div className="offer-actions">
                                                    <button 
                                                        className="cancel-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCancelJobOffer(offer.id);
                                                        }}
                                                    >
                                                        Cancel Offer
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data-message">No job offers created yet.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="dashboard-section">
                        <h3>Available Nurses ({nurses.length})</h3>
                        <div className="nurses-list">
                            {nurses.length > 0 ? (
                                <ul className="nurse-list">
                                    {nurses.map((nurse) => (
                                        <li 
                                            key={nurse.id} 
                                            className="nurse-item"
                                            onClick={() => navigate(`/nurse/${nurse.id}`)}
                                        >
                                            <div className="nurse-header">
                                                <img
                                                    src={nurse.profilePicture || defaultProfilePicture}
                                                    alt={nurse.name}
                                                    className="nurse-thumbnail"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = defaultProfilePicture;
                                                    }}
                                                />
                                                <div className="nurse-basic-info">
                                                    <div className="nurse-name">{nurse.name}</div>
                                                    <div className="nurse-rating">
                                                        {Array.from({ length: Math.round(nurse.rating || 0) }).map((_, i) => (
                                                            <i key={i} className="bi bi-star-fill"></i>
                                                        ))}
                                                        {Array.from({ length: 5 - Math.round(nurse.rating || 0) }).map((_, i) => (
                                                            <i key={i} className="bi bi-star"></i>
                                                        ))}
                                                        <span className="rating-value">({nurse.rating?.toFixed(1) || "0.0"})</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="nurse-details">
                                                {nurse.nurseDetails?.certifications?.length > 0 && (
                                                    <div className="nurse-detail">
                                                        <span className="detail-label">Certifications:</span>
                                                        <div className="skill-tags">
                                                            {nurse.nurseDetails.certifications.map((cert, index) => (
                                                                <span key={index} className="skill-tag">
                                                                    {cert.replace(/_/g, ' ')}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {nurse.nurseDetails?.experienceYears > 0 && (
                                                    <div className="nurse-detail">
                                                        <span className="detail-label">Experience:</span>
                                                        <span>{nurse.nurseDetails.experienceYears} years</span>
                                                    </div>
                                                )}
                                                
                                                {nurse.nurseDetails?.hourlyRate > 0 && (
                                                    <div className="nurse-detail">
                                                        <span className="detail-label">Hourly Rate:</span>
                                                        <span className="hourly-rate">${nurse.nurseDetails.hourlyRate}/hr</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="nurse-actions">
                                                <button 
                                                    className="view-profile-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/nurse/${nurse.id}`);
                                                    }}
                                                >
                                                    View Profile
                                                </button>
                                                <button 
                                                    className="create-offer-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCreateJobOffer(nurse.id, null);
                                                    }}
                                                >
                                                    Create Offer
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data-message">No nurses available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default HospitalDashboard;
