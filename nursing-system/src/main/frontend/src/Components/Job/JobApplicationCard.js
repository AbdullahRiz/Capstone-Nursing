import React from "react";
import "./JobApplicationCard.css";
import { Link } from "react-router-dom";

const JobApplicationCard = ({ id, title, applicants, targetDate, updatedAt }) => {
    return (
        <Link to={`/job/${id}`} className="application-card-link">
            <div className="application-card" key={id}>
                <h3>{title}</h3>
                <div className="application-details">
                    <p><strong>Applicants:</strong> {applicants}</p>
                    <p><strong>Last Updated:</strong> {updatedAt}</p>
                    <p><strong>Target Date:</strong> {targetDate}</p>
                </div>
            </div>
        </Link>
    );
};

export default JobApplicationCard;
