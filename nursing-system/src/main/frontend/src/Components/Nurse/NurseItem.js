import React, { useEffect, useState } from "react";
import "./NurseItem.css";
import defaultProfilePicture from "../../Assets/default-user-photo.png";
import Rating from "../Buttons/Rating/Rating";
import HireModal from "../Job/Contract/HireModel";

const NurseItem = ({ nurse, job }) => {
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
    const [selectedFile, setSelectedFile] = useState(null);

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
                    jobId: job.id
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

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleContractUpload = async () => {
        if (!selectedFile) {
            alert('Please select a contract to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/uploadContract', {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken")
                },
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Contract uploaded successfully!');
            } else {
                alert('Contract upload failed.');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('An error occurred during contract upload.');
        }
    };

    const handleContractDownload = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/contracts/CS5764_Project1.pdf", {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken")
                },
                responseType: 'blob',
            });
            const blob = await response.blob();
            console.log(blob)
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'file.pdf'); // Set desired file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const checkIfAlreadyHired = async () => {
        try {
            const response = await fetch(`/api/checkIfHired?nurseId=${nurse.applicantId}&jobId=${job.id}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken"),
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data?.hired) {
                    setIsHired(true); // mark as hired
                }
            } else {
                console.error("Failed to check hire status");
            }
        } catch (err) {
            console.error("Error checking hire status:", err);
        }
    };


    useEffect(() => {
        // Add a small delay to stagger API calls and prevent overwhelming the server
        const timeoutId = setTimeout(() => {
            const fetchNurseDetails = async () => {
                try {
                    // Check if we already have this nurse's details in sessionStorage
                    const cachedNurse = sessionStorage.getItem(`nurse_${nurse.applicantId}`);

                    if (cachedNurse) {
                        // Use cached data if available
                        const jsonNurse = JSON.parse(cachedNurse)
                        setNurseDetails(jsonNurse);
                        setLoading(false);
                        setIsHired(jsonNurse.isHired);
                        return;
                    }

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
                        ratingHistory: user.ratingHistory || {},
                        specialty: user.nurseDetails?.certifications?.join(", ") || "No specialty",
                        experience: user.nurseDetails?.experienceYears?.toString() + " years" || "No experience",
                        hoursAvailable: nurse.availableHours?.toString() || "No availability",
                        profilePicture: user.profilePicture || defaultProfilePicture,
                        isHired: user.nurseDetails?.isHired,
                    };

                    // Cache the nurse details in sessionStorage
                    sessionStorage.setItem(`nurse_${nurse.applicantId}`, JSON.stringify(mappedNurse));

                    setNurseDetails(mappedNurse);
                    setIsHired(mappedNurse.isHired); // Always start with not hired until popup confirms

                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchNurseDetails();
        }, Math.random() * 300); // Random delay between 0-300ms to stagger requests

        return () => clearTimeout(timeoutId);
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
                    <Rating userName={nurseDetails.name} userEmail={nurseDetails.email} totalRatings={Object.keys(nurseDetails.ratingHistory).length} averageRating={nurseDetails.rating} />
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
                job={job}
                nurseId={nurse.applicantId}
                nurseEmail={nurseDetails.email}
                onHireSuccess={(finalData) => {
                    console.log("Complete Data sent from HireModal =>", finalData);
                    setIsHired(true);
                    setShowHireModal(false);
                }}
            />
        </div>
    );
};

export default NurseItem;
