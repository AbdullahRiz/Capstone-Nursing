import React, { useEffect, useState } from "react";
import "./JobApplicationCard.css";
import { Link } from "react-router-dom";

const JobApplicationCard = ({ id, title, applicants, targetDate, updatedAt, isHired, userRole }) => {
    const isHospital = userRole === "HOSPITAL";

    return (
        <Link to={`/job/${id}`} className="application-card-link">
            <div className="application-card" key={id}>
                <div className="card-header">
                    <h3>{title}</h3>
                    {isHired && <span className="hired-badge">Hired</span>}
                </div>

                <div className="application-details">
                    <p><strong>Applicants:</strong> {applicants}</p>
                    <p><strong>Last Updated:</strong> {updatedAt}</p>
                    <p><strong>Target Date:</strong> {targetDate}</p>
                </div>

                {isHospital && (
                    <button className={`hire ${isHired ? "disabled" : ""}`}>
                        {isHired ? "View" : "Hire"}
                    </button>
                )}
            </div>
        </Link>
    );
};

export default JobApplicationCard;


