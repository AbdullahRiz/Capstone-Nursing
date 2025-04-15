import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleMap,
    LoadScript,
    Marker,
    Autocomplete,
    Circle,
} from "@react-google-maps/api";
import "./NurseDashboard.css";
import defaultProfilePicture from "../../Assets/user.png";
import Footer from "../Footer/Footer";
import StyledWrapper from "../Buttons/Rating/RatingStyles";
import Week from "../Buttons/weeks/week";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";

const containerStyle = {
    width: "100%",
    height: "400px",
};

const defaultCenter = {
    lat: 38.8376,  // E Glebe Rd, Alexandria, VA
    lng: -77.0531,
};

const NurseDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState(defaultCenter);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [jobOffers, setJobOffers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [autocomplete, setAutocomplete] = useState(null);
    const [hours, setHours] = useState("");
    const [pay, setPay] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [useCustomHours, setUseCustomHours] = useState(false);
    const [useCustomAmount, setUseCustomAmount] = useState(false);
    const [isPaymentSetup, setIsPaymentSetup] = useState(false);

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

            if (!userResponse.ok) throw new Error("Failed to fetch user details");
            const userData = await userResponse.json();
            
            // Check if user is a nurse
            if (userData.role !== "NURSE") {
                // Redirect to appropriate dashboard based on role
                if (userData.role === "HOSPITAL") {
                    navigate("/hospitalDashboard");
                    return;
                } else {
                    navigate("/");
                    return;
                }
            }
            
            setUser(userData);
            
            // Fetch applied jobs
            try {
                const appliedJobsResponse = await fetch("/api/listAppliedJobs", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (!appliedJobsResponse.ok) {
                    console.error("Failed to fetch applied jobs:", appliedJobsResponse.status);
                } else {
                    const appliedJobsData = await appliedJobsResponse.json();
                    setAppliedJobs(appliedJobsData);
                }
            } catch (err) {
                console.error("Error fetching applied jobs:", err);
            }
            
            // Fetch job offers for the nurse
            if (userData.id) {
                try {
                    const offersResponse = await fetch(`/api/jobOffers/${userData.id}`, {
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
                        setJobOffers(offersData);
                    }
                } catch (err) {
                    console.error("Error fetching job offers:", err);
                }
                
                // Handle reviews from user data
                if (userData.ratingHistory) {
                    let reviewsArray = [];
                    
                    // Check if ratingHistory is an object with nested rating objects
                    if (typeof userData.ratingHistory === 'object' && !Array.isArray(userData.ratingHistory)) {
                        // Transform the rating history object into an array of review objects
                        reviewsArray = Object.entries(userData.ratingHistory).map(([reviewerId, ratingObj]) => {
                            // Check if the value is an object with rating properties
                            if (typeof ratingObj === 'object' && ratingObj !== null && 'rating' in ratingObj) {
                                return {
                                    reviewerId,
                                    rating: Math.round(ratingObj.rating), // Ensure rating is an integer for star display
                                    reviewerName: ratingObj.reviewerName || "Hospital", // Use provided name or default
                                    comment: ratingObj.message || "", // Use provided message or empty string
                                    date: new Date().toISOString() // Default date
                                };
                            } else {
                                // Handle the case where it's just a number (old format)
                                return {
                                    reviewerId,
                                    rating: Math.round(ratingObj), // Ensure rating is an integer for star display
                                    reviewerName: "Hospital", // Default name
                                    comment: "", // No comment in old format
                                    date: new Date().toISOString() // Default date
                                };
                            }
                        });
                        console.log("Transformed reviews:", reviewsArray);
                    } 
                    // Check if ratingHistory is an array (future format)
                    else if (Array.isArray(userData.ratingHistory)) {
                        // The ratingHistory is an array of RatingItem objects
                        reviewsArray = userData.ratingHistory.map(ratingItem => {
                            return {
                                rating: Math.round(ratingItem.rating), // Ensure rating is an integer for star display
                                reviewerName: ratingItem.reviewerName,
                                comment: ratingItem.message,
                                date: new Date().toISOString() // Default date
                            };
                        });
                        console.log("Reviews from API (array format):", reviewsArray);
                    }
                    
                    setReviews(reviewsArray);
                }
            }

            const response = await fetch(`/api/hasSetupPayment?email=${userData.email}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            const json = await response.json();
            console.log(json)

            if (json.message === "true") {
                setIsPaymentSetup(true)
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

    // Set geolocation
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation({ lat: latitude, lng: longitude });
            },
            (err) => {
                console.error("Geolocation error:", err.message);
                // fallback to default location
                setLocation(defaultCenter);
            }
        );
    }, []);

    // Load nearby hospitals on map load
    const handleMapLoad = (map) => {
        const service = new window.google.maps.places.PlacesService(map);

        service.nearbySearch(
            {
                location,
                radius: 50000, // ~31 miles (in meters) for debugging
                type: "hospital",
            },
            (results, status) => {
                console.log("Hospital search results:", results, "Status:", status);

                if (
                    status === window.google.maps.places.PlacesServiceStatus.OK &&
                    results.length > 0
                ) {
                    const parsedResults = results.map((place) => ({
                        name: place.name,
                        position: {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                        },
                    }));
                    setHospitals(parsedResults);
                } else {
                    console.warn("No hospitals found or PlacesService failed:", status);
                    setHospitals([]);
                }
            }
        );
    };

    // Handle Autocomplete
    const handlePlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            const loc = place.geometry?.location;
            if (loc) {
                setLocation({ lat: loc.lat(), lng: loc.lng() });
            }
        }
    };
    
    // Handle job offer accept/decline
    const handleOfferAction = async (offerId, status) => {
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
                body: JSON.stringify({ status }),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to update offer status: ${response.status}`);
            }
            
            // Update the local state to reflect the change
            setJobOffers(prevOffers => 
                prevOffers.map(offer => 
                    offer.id === offerId ? { ...offer, status } : offer
                )
            );
            
            // Show success message
            alert(`Offer ${status.toLowerCase()} successfully!`);
            
        } catch (error) {
            console.error("Error updating offer status:", error);
            alert(`Failed to ${status.toLowerCase()} offer: ${error.message}`);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <div className="nurse-dashboard-container">
                <div className="nurse-left">
                    <img
                        src={user?.profilePicture || defaultProfilePicture}
                        alt={user?.name || "Nurse"}
                        className="nurse-profile-picture"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultProfilePicture;
                        }}
                    />

                    <div className="nurse-card">
                        <div className="nurse-filter-bar">
                            <h4 className="nurse-card-title">Set Availability:</h4>

                            <div className="week-wrapper">
                                <Week selectedDays={selectedDays} setSelectedDays={setSelectedDays}/>
                            </div>

                            {/* Hours/Day */}
                            <div className="nurse-filter-field">
                                <label>Hours/Day:</label>
                                {!useCustomHours ? (
                                    <select
                                        value={hours}
                                        onChange={(e) => {
                                            if (e.target.value === "custom") {
                                                setUseCustomHours(true);
                                                setHours("");
                                            } else {
                                                setHours(e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Select hours</option>
                                        {[4, 6, 8, 10, 12].map((hr) => (
                                            <option key={hr} value={hr}>{hr} hrs</option>
                                        ))}
                                        <option value="custom">Custom Hours</option>
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        placeholder="Enter custom hours"
                                        value={hours}
                                        min={1}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setHours(val >= 1 ? val : 1);
                                        }}
                                        onBlur={() => {
                                            if (!hours || hours < 1) setHours(1);
                                        }}
                                    />
                                )}
                            </div>

                            {/* Pay/hr */}
                            <div className="nurse-filter-field">
                                <label>Pay/hr ($):</label>
                                {!useCustomAmount ? (
                                    <select
                                        value={pay}
                                        onChange={(e) => {
                                            if (e.target.value === "custom") {
                                                setUseCustomAmount(true);
                                                setPay("");
                                            } else {
                                                setPay(e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Select pay</option>
                                        {[45, 50, 60, 75, 90].map((amt) => (
                                            <option key={amt} value={amt}>${amt}</option>
                                        ))}
                                        <option value="custom">Custom Amount</option>
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        placeholder="Enter custom pay"
                                        value={pay}
                                        min={1}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setPay(val >= 1 ? val : 1);
                                        }}
                                        onBlur={() => {
                                            if (!pay || pay < 1) setPay(1);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nurse-right">
                    <div className="nurse-top-row">
                        <div className="nurse-stat-box">
                            <h3>Reviews ({reviews.length})</h3>
                            <div className="nurse-reviews-list">
                                {reviews.length > 0 ? (
                                    <ul className="review-list">
                                        {reviews.map((review, index) => (
                                            <li key={index} className="review-item">
                                                <div className="review-rating">
                                                    {Array.from({ length: review.rating }).map((_, i) => (
                                                        <i key={i} className="bi bi-star-fill"></i>
                                                    ))}
                                                    {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                                        <i key={i} className="bi bi-star"></i>
                                                    ))}
                                                </div>
                                                <div className="review-from">
                                                    From: {review.reviewerName || "Hospital"}
                                                </div>
                                                <div className="review-date">
                                                    {new Date(review.date).toLocaleDateString()}
                                                </div>
                                                <div className="review-comment">{review.comment || "No comment provided."}</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-data-message">No reviews yet.</p>
                                )}
                            </div>
                        </div>
                        <div className="nurse-stat-box">
                            <h3>Job Offers ({jobOffers.length})</h3>
                            <div className="nurse-offers-list">
                                {jobOffers.length > 0 ? (
                                    <ul className="offer-list">
                                        {jobOffers.slice(0, 5).map((offer) => (
                                            <li key={offer.id} className="offer-item">
                                                <div className="offer-header">
                                                    <div className="offer-title">{offer.jobTitle}</div>
                                                    <div className="offer-status">
                                                        Status: <span className={`status-${offer.status.toLowerCase()}`}>
                                                            {offer.status}
                                                        </span>
                                                    </div>
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
                                                            className="accept-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOfferAction(offer.id, "ACCEPTED");
                                                            }}
                                                        >
                                                            Accept Offer
                                                        </button>
                                                        <button 
                                                            className="decline-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOfferAction(offer.id, "DECLINED");
                                                            }}
                                                        >
                                                            Decline Offer
                                                        </button>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                        {jobOffers.length > 5 && (
                                            <li className="offer-item more-item">
                                                +{jobOffers.length - 5} more offers
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <p className="no-data-message">No job offers yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="nurse-applications-box">
                        <h3>My Applications ({appliedJobs.length})</h3>
                        <div className="nurse-applications-list">
                            {appliedJobs.length > 0 ? (
                                <ul className="application-list">
                                    {appliedJobs.map((job) => (
                                        <li 
                                            key={job.id} 
                                            className="application-item"
                                            onClick={() => navigate(`/job/${job.id}`)}
                                        >
                                            <div className="application-header">
                                                <div className="application-title">{job.jobTitle}</div>
                                                <div className="application-date">
                                                    Applied: {new Date(job.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                            <div className="application-description">
                                                {job.description && job.description.length > 150 
                                                    ? `${job.description.substring(0, 150)}...` 
                                                    : job.description}
                                            </div>
                                            
                                            <div className="application-details">
                                                <div className="application-detail">
                                                    <span className="detail-label">Required Skills:</span>
                                                    <div className="skill-tags">
                                                        {job.requiredSkills && job.requiredSkills.map((skill, index) => (
                                                            <span key={index} className="skill-tag">
                                                                {skill.replace(/_/g, ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {job.applicants && job.applicants.length > 0 && 
                                                 job.applicants.find(app => app.applicantId === user?.id) && (
                                                    <>
                                                        <div className="application-detail">
                                                            <span className="detail-label">Your Availability:</span>
                                                            <div className="availability-info">
                                                                <div className="days-available">
                                                                    {job.applicants.find(app => app.applicantId === user?.id).availableDays?.map((day, index) => (
                                                                        <span key={index} className="day-tag">
                                                                            {day.substring(0, 3)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <div className="hours-available">
                                                                    <i className="bi bi-clock"></i> 
                                                                    {job.applicants.find(app => app.applicantId === user?.id).availableHours} hrs/week
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="application-detail">
                                                            <span className="detail-label">Your Skills:</span>
                                                            <div className="skill-tags">
                                                                {job.applicants.find(app => app.applicantId === user?.id).skills?.map((skill, index) => (
                                                                    <span key={index} className="skill-tag your-skill">
                                                                        {skill.replace(/_/g, ' ')}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                
                                                {job.minPay > 0 && job.maxPay > 0 && (
                                                    <div className="pay-range">
                                                        <i className="bi bi-cash"></i> ${job.minPay} - ${job.maxPay}/hr
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data-message">No job applications yet.</p>
                            )}
                        </div>
                    </div>
                    <div className="nurse-applications-box">
                        <h3>Payment Setup Status</h3>
                        <div className="nurse-applications-list">
                            {isPaymentSetup ? (
                                <div>
                                    Payment Successfully Setup!
                                </div>
                            ) : (
                                <div>
                                    You Need to Setup Payment!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-center mt-4 mb-3">
                    <Link to="/contracts" className="btn btn-primary">
                        View My Contracts
                    </Link>
                </div>

                <div className="nurse-map">
                    <LoadScript
                        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                        libraries={["places"]}
                    >
                        <StyledWrapper>
                            <Autocomplete
                                onLoad={(autoC) => setAutocomplete(autoC)}
                                onPlaceChanged={handlePlaceChanged}
                            >
                                <div className="nurse-search">
                                    <input type="text" placeholder="Search for places..."/>
                                    <button type="submit">Go</button>
                                </div>
                            </Autocomplete>
                        </StyledWrapper>

                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={location}
                            zoom={14}
                            onLoad={handleMapLoad}
                        >
                            {/* Pin user's location */}
                            <Marker position={location} title="Your Location"/>

                            {/* 15-mile radius (temporarily 31 miles for debugging) */}
                            <Circle
                                center={location}
                                radius={50000}
                                options={{
                                    fillColor: "#d1e0ff",
                                    fillOpacity: 0.25,
                                    strokeColor: "#4285F4",
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                }}
                            />

                            {/* Hospital markers */}
                            {hospitals.map((place, index) => (
                                <Marker
                                    key={index}
                                    position={place.position}
                                    title={place.name}
                                />
                            ))}
                        </GoogleMap>
                    </LoadScript>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default NurseDashboard;
