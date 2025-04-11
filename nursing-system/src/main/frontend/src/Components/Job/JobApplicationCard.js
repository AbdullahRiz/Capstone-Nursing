import React, { useEffect, useState } from "react";
import "./JobApplicationCard.css";
import { Link } from "react-router-dom";

const JobApplicationCard = ({ id, title, applicants, targetDate, updatedAt, isHired }) => {
    const [isHospital, setIsHospital] = useState(false);
    
    useEffect(() => {
        // Check if the current user is a hospital
        const checkUserRole = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                if (!token) return;
                
                const response = await fetch("/api/getUserDetails", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (!response.ok) return;
                
                const userData = await response.json();
                setIsHospital(userData.role === "HOSPITAL");
            } catch (err) {
                console.error("Error checking user role:", err);
            }
        };
        
        checkUserRole();
    }, []);
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
