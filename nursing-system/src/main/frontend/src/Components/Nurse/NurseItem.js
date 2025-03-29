import React, { useEffect, useState } from "react";
import "./NurseItem.css";
import defaultProfilePicture from "../../Assets/default-user-photo.png";


const NurseItem = ({ nurse }) => {
    const [nurseDetails, setNurseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHired, setIsHired] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleHireClick = async () => {
         try {
            const response = await fetch("http://localhost:8080/api/hireNurse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwtToken")
                },
                body: JSON.stringify({
                    email: nurseDetails.email, // You can customize this per nurse/job
                })
            });

            const data = await response.json();

            setIsHired(true);

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
                    amount: 2000, // You can customize this per nurse/job
                    applicantId: nurse.applicantId,
                    jobId: nurse.jobId
                })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
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
                    hoursAvailable: nurse.availableHours.toString() || "No availability",
                    profilePicture: user.profilePicture || defaultProfilePicture,
                    isHired: user.nurseDetails?.isHired
                };

                setNurseDetails(mappedNurse);
                setIsHired(mappedNurse.isHired)
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
                <div>
                    <input type="file" onChange={handleFileChange} />
                    <button className="Paybutton" onClick={handleContractUpload}>Upload</button>
                    <button className="Paybutton" onClick={handleContractDownload}>Download Contract</button>
                    <button className="Paybutton" onClick={handlePayClick}>Pay</button>
                </div>
            )}
            </div>
        </div>
    );
};

export default NurseItem;