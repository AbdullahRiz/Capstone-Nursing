import React, { useEffect, useState } from "react";
import {
    GoogleMap,
    LoadScript,
    Marker,
    Autocomplete,
    Circle,
} from "@react-google-maps/api";
import "./NurseListDashboard.css";
import defaultProfilePicture from "../../Assets/user.png";
import Footer from "../Footer/Footer";
import StyledWrapper from "../Buttons/Rating/RatingStyles";
import Week from "../Buttons/weeks/week";

const containerStyle = {
    width: "100%",
    height: "400px",
};

const defaultCenter = {
    lat: 38.8376,  // E Glebe Rd, Alexandria, VA
    lng: -77.0531,
};

const NurseListDashboard = () => {
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState(defaultCenter);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [hours, setHours] = useState("");
    const [pay, setPay] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [useCustomHours, setUseCustomHours] = useState(false);
    const [useCustomAmount, setUseCustomAmount] = useState(false);

    // Fetch user info
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                const response = await fetch("/api/getUserDetails", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch user details");
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

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
                            This is a placeholder for the total jobs applied by the nurse.
                        </div>
                        <div className="nurse-stat-box">
                            This is a placeholder for the hospitals the nurse has worked at.
                        </div>
                    </div>
                    <div className="nurse-review-box">
                        This is a placeholder for the reviews from clients or hospitals.
                    </div>
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

export default NurseListDashboard;