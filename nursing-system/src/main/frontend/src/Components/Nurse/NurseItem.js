import React, { useEffect, useState } from "react";
import "./NurseItem.css";
import defaultProfilePicture from "../../Assets/default-user-photo.png";

const NurseItem = ({ nurse }) => {
    const [nurseDetails, setNurseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch nurse details using the applicantId
    useEffect(() => {
        const fetchNurseDetails = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                const response = await fetch(`/api/getUserById/${nurse.applicantId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch nurse details");
                }

                const user = await response.json();

                // Map the fetched user data to the nurse object
                const mappedNurse = {
                    name: user.name || "Unknown",
                    specialty: user.nurseDetails?.certifications?.join(", ") || "No specialty",
                    experience: user.nurseDetails?.experienceYears?.toString() + " years" || "No experience",
                    hoursAvailable: nurse.availableHours.toString() || "No availability",
                    profilePicture: user.profilePicture || defaultProfilePicture,
                };

                setNurseDetails(mappedNurse);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNurseDetails();
    }, [nurse.applicantId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!nurseDetails) {
        return <p>No nurse details found.</p>;
    }

    return (
        <div className="nurse-item">
            <div className="nurse-profile">
                <img src={nurseDetails.profilePicture} alt={nurseDetails.name} className="profile-picture" />
                <div className="nurse-info">
                    <h3>{nurseDetails.name}</h3>
                    <p><strong>Specialty:</strong> {nurseDetails.specialty}</p>
                    <p><strong>Experience:</strong> {nurseDetails.experience}</p>
                    <p><strong>Hours Available:</strong> {nurseDetails.hoursAvailable}</p>
                </div>
            </div>
            <button className="hire-button">Hire</button>
        </div>
    );
};

export default NurseItem;