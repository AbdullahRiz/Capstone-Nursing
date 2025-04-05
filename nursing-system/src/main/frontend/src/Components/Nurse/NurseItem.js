import React, { useEffect, useState } from "react";
import "./NurseItem.css";
import defaultProfilePicture from "../../Assets/default-user-photo.png";
import Rating from "../Buttons/Rating/Rating";
import HireModal from "../Job/Contract/HireModel";

const NurseItem = ({ nurse }) => {
    const [nurseDetails, setNurseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHired, setIsHired] = useState(false);
    const [showHireModal, setShowHireModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        days: '',
        hoursPerDay: '',
        selectedDays: [],
    });

    const handleHireClick = () => {
        setShowHireModal(true);
    };

    const handleSubmitHire = async () => {
        // Basic form validation (optional but recommended)
        if (!formData.amount || !formData.days || !formData.hoursPerDay || formData.selectedDays.length === 0) {
            alert("Please fill out all fields before submitting.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/hireNurse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken")
                },
                body: JSON.stringify({
                    email: nurseDetails.email,
                    ...formData
                })
            });

            const data = await response.json();
            console.log("Hire response", data);

            // Set to hired only after successful submission
            setIsHired(true);
            setShowHireModal(false);
            setFormData({
                amount: '',
                days: '',
                hoursPerDay: '',
                selectedDays: [],
            });

        } catch (error) {
            console.error("Hiring error:", error);
            alert("An error occurred during hiring.");
        }
    };

    const handlePayClick = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken")
                },
                body: JSON.stringify({
                    amount: formData.amount || 2000, // fallback
                    applicantId: nurse.applicantId,
                    jobId: nurse.jobId
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Checkout failed: " + data.message);
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("An error occurred during payment.");
        }
    };

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

                const mappedNurse = {
                    name: user.name || "Unknown",
                    email: user.email || "Unknown",
                    rating: user.rating || 0,
                    specialty: user.nurseDetails?.certifications?.join(", ") || "No specialty",
                    experience: user.nurseDetails?.experienceYears?.toString() + " years" || "No experience",
                    hoursAvailable: nurse.availableHours?.toString() || "No availability",
                    profilePicture: user.profilePicture || defaultProfilePicture,
                };

                setNurseDetails(mappedNurse);
                setIsHired(false); // Always start with not hired until popup confirms

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNurseDetails();
    }, [nurse.applicantId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!nurseDetails) return <p>No nurse details found.</p>;

    return (
        <div className="nurse-item">
            <div className="nurse-profile">
                <img src={nurseDetails.profilePicture} alt={nurseDetails.name} className="profile-picture" />
                <div className="nurse-info">
                    <h3>{nurseDetails.name} {nurseDetails.rating > 4 ? "(Recommended)" : null}</h3>
                    <p><strong>Specialty:</strong> {nurseDetails.specialty}</p>
                    <p><strong>Experience:</strong> {nurseDetails.experience}</p>
                    <p><strong>Hours Available:</strong> {nurseDetails.hoursAvailable}</p>
                    <Rating userName={nurseDetails.name} />
                </div>
            </div>

            <div className="button-container">
                <button
                    className={`hire-button ${isHired ? "hired" : ""}`}
                    onClick={handleHireClick}
                    disabled={isHired}
                >
                    {isHired ? "Hired" : "Hire"}
                </button>

                {isHired && (
                    <button className="Paybutton" onClick={handlePayClick}>
                        Pay
                    </button>
                )}
            </div>

            <HireModal
                visible={showHireModal}
                onClose={() => setShowHireModal(false)}
                formData={formData}
                setFormData={setFormData}
                setIsHired={setIsHired}
                setShowHireModal={setShowHireModal}
            />
        </div>
    );
};

export default NurseItem;