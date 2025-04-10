import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import defaultProfilePicture from "../../Assets/default-user-photo.png";
import Footer from "../Footer/Footer";
import "./Profile.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                
                if (!token) {
                    navigate("/signin");
                    return;
                }

                const response = await fetch("http://localhost:8080/api/getUserDetails", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const userData = await response.json();
                setUser(userData);
                
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
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setError("Failed to load profile. Please try again later.");
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    if (loading) {
    return (
        <>
        <div className="profile-container">
                <div className="loading-spinner">Loading...</div>
        </div>
        <Footer />
        </>
    );
    }

    if (error) {
        return (
            <>
            <div className="profile-container">
                <div className="error-message">{error}</div>
            </div>
            <Footer />
            </>
        );
    }

    return (
        <>
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
            </div>
            
            <div className="profile-content">
                <div className="profile-image-section">
                    <img 
                        src={user?.profilePicture || defaultProfilePicture} 
                        alt="Profile" 
                        className="profile-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultProfilePicture;
                        }}
                    />
                    <button className="update-photo-btn">Update Photo</button>
                </div>
                
                <div className="profile-details">
                    <div className="profile-info-group">
                        <h2>Personal Information</h2>
                        <div className="profile-info-item">
                            <span className="info-label">Name:</span>
                            <span className="info-value">{user?.name || "Not provided"}</span>
                        </div>
                        <div className="profile-info-item">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{user?.email || "Not provided"}</span>
                        </div>
                        <div className="profile-info-item">
                            <span className="info-label">Phone:</span>
                            <span className="info-value">{user?.phone || "Not provided"}</span>
                        </div>
                    </div>
                    
                    {user?.role === "NURSE" && (
                        <div className="profile-info-group">
                            <h2>Professional Information</h2>
                            <div className="profile-info-item">
                                <span className="info-label">Specialization:</span>
                                <span className="info-value">{user?.specialization || "Not provided"}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="info-label">Experience:</span>
                                <span className="info-value">{user?.experience ? `${user.experience} years` : "Not provided"}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="info-label">Availability:</span>
                                <span className="info-value">{user?.availableHours ? `${user.availableHours} hours/week` : "Not provided"}</span>
                            </div>
                        </div>
                    )}
                    
                    {user?.role === "HOSPITAL" && (
                        <div className="profile-info-group">
                            <h2>Hospital Information</h2>
                            <div className="profile-info-item">
                                <span className="info-label">Hospital Name:</span>
                                <span className="info-value">{user?.hospitalName || "Not provided"}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="info-label">Location:</span>
                                <span className="info-value">{user?.location || "Not provided"}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="profile-reviews">
                <h2>Reviews & Ratings</h2>
                <div className="profile-rating-summary">
                    <div className="overall-rating">
                        <span className="rating-number">{user?.rating?.toFixed(1) || "0.0"}</span>
                        <div className="rating-stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <i 
                                    key={i} 
                                    className={`bi ${i < Math.round(user?.rating || 0) ? 'bi-star-fill' : 'bi-star'}`}
                                ></i>
                            ))}
                        </div>
                        <span className="rating-count">({reviews.length} reviews)</span>
                    </div>
                </div>
                
                <div className="reviews-list">
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
                        <p className="no-reviews-message">No reviews yet.</p>
                    )}
                </div>
            </div>
            
            <div className="profile-actions">
                <button className="edit-profile-btn">Edit Profile</button>
                <button className="change-password-btn">Change Password</button>
            </div>
        </div>
        <Footer />
        </>
    );
};

export default Profile;
