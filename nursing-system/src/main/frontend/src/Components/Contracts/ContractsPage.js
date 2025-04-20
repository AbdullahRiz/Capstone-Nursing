import React, { useState, useEffect } from "react";
import "./ContractsPage.css";
import Footer from "../Footer/Footer";

const ContractsPage = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hospitalNames, setHospitalNames] = useState({});

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("jwtToken");
                
                if (!token) {
                    throw new Error("No authentication token found");
                }
                
                // Fetch user details to get the user ID
                const userResponse = await fetch("/api/getUserDetails", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!userResponse.ok) {
                    throw new Error("Failed to fetch user details");
                }
                
                const userData = await userResponse.json();
                
                // Fetch job offers for the user
                const offersResponse = await fetch(`/api/jobOffers/${userData.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (!offersResponse.ok) {
                    throw new Error("Failed to fetch job offers");
                }
                
                const offersData = await offersResponse.json();
                setContracts(offersData);
                
                // Fetch hospital names for each offer
                const hospitalIds = [...new Set(offersData.map(offer => offer.hospitalId))];
                const hospitalNamesMap = {};
                
                await Promise.all(
                    hospitalIds.map(async (hospitalId) => {
                        try {
                            const hospitalResponse = await fetch(`/api/getUserById/${hospitalId}`, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            
                            if (hospitalResponse.ok) {
                                const hospitalData = await hospitalResponse.json();
                                hospitalNamesMap[hospitalId] = hospitalData.name || "Unknown Hospital";
                            }
                        } catch (err) {
                            console.error(`Error fetching hospital name for ID ${hospitalId}:`, err);
                            hospitalNamesMap[hospitalId] = "Unknown Hospital";
                        }
                    })
                );
                
                setHospitalNames(hospitalNamesMap);
                
            } catch (err) {
                console.error("Error fetching contracts:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchContracts();
    }, []);
    
    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };
    
    // Helper function to determine if a contract is current or previous
    const isCurrentContract = (contract) => {
        return contract.status === "ACCEPTED" && 
               contract.endDate && 
               new Date(contract.endDate) >= new Date();
    };
    
    // Filter contracts into current and previous
    const currentContracts = contracts.filter(isCurrentContract);
    const previousContracts = contracts.filter(contract => !isCurrentContract(contract));

    const renderContracts = (contracts) => (
        <div className="contracts-list">
            {contracts.map(contract => (
                <div key={contract.id} className="contract-card">
                    <h2 className="hospital-name">{hospitalNames[contract.hospitalId] || "Unknown Hospital"}</h2>
                    <p><strong>Job Title:</strong> {contract.jobTitle || "Untitled Position"}</p>
                    <p><strong>Pay per Hour:</strong> ${contract.rate || 0}</p>
                    <p><strong>Total Compensation:</strong> ${contract.totalComp || 0}</p>
                    <p><strong>Hours per Day:</strong> {contract.hours || 0}</p>
                    <p><strong>Work Days:</strong> {contract.days?.map(day => day.substring(0, 3)).join(", ") || "Not specified"}</p>
                    <p><strong>Start Date:</strong> {formatDate(contract.startDate)}</p>
                    <p><strong>End Date:</strong> {formatDate(contract.endDate)}</p>
                    <p><strong>Status:</strong> <span className={`status-${contract.status?.toLowerCase()}`}>{contract.status}</span></p>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="contracts-container">
                <h1 className="contracts-title">Your Contracts</h1>
                <p>Loading contracts...</p>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="contracts-container">
                <h1 className="contracts-title">Your Contracts</h1>
                <p className="error-message">Error: {error}</p>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <div className="contracts-container">
                <h1 className="contracts-title">Your Contracts</h1>

                <h2 className="section-title">Current Contracts</h2>
                {currentContracts.length > 0 ? 
                    renderContracts(currentContracts) : 
                    <p className="no-contracts-message">You don't have any current contracts.</p>
                }

                <h2 className="section-title">Previous Contracts</h2>
                {previousContracts.length > 0 ? 
                    renderContracts(previousContracts) : 
                    <p className="no-contracts-message">You don't have any previous contracts.</p>
                }
            </div>
            <Footer />
        </>
    );
};

export default ContractsPage;
