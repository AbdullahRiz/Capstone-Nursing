import React from "react";
import "./JobApplicationCard.css";
import { Link } from "react-router-dom";

const JobApplicationCard = ({ id, title, applicants, targetDate, updatedAt, isHired, userRole, description }) => {
    const isHospital = userRole === "HOSPITAL";
    
    // Truncate title if it's too long
    const truncatedTitle = title.length > 30 ? `${title.substring(0, 30)}...` : title;
    
    // Truncate description if it exists and is too long
    const truncatedDescription = description && description.length > 100 
        ? `${description.substring(0, 100)}...` 
        : description;

    return (
        <Link to={`/job/${id}`} className="application-card-link">
            <div className="application-card" key={id}>
                <div className="card-content">
                    <div className="card-header">
                        <h3>{truncatedTitle}</h3>
                        {isHired && <span className="hired-badge">Hired</span>}
                    </div>

                    {description && (
                        <div className="card-description">
                            <p>{truncatedDescription}</p>
                        </div>
                    )}

                    <div className="application-details">
                        <p><strong>Applicants:</strong> {applicants}</p>
                        <p><strong>Last Updated:</strong> {updatedAt}</p>
                        <p><strong>Target Date:</strong> {targetDate}</p>
                    </div>
                </div>

                {isHospital && (
                    <div className="card-button-container">
                        <button className={`hire ${isHired ? "disabled" : ""}`}>
                            {isHired ? "View" : "Hire"}
                        </button>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default JobApplicationCard;
