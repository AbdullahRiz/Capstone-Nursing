import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import nurseImage from "../../Assets/viki-mohamad-hYcSP6SpoK0-unsplash.jpg";
import nurse from "../../Assets/national-cancer-institute-701-FJcjLAQ-unsplash 2.jpg";
import hospital from "../../Assets/branimir-balogovic-fAiQRv7FgE0-unsplash.jpg";
import Footer from "../Footer/Footer";

const Dummy = ({ isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const sections = document.querySelectorAll(".scroll-section, .hospital");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    } else {
                        entry.target.classList.remove("visible");
                    }
                });
            },
            { threshold: 0.1 }
        );

        sections.forEach((section) => {
            observer.observe(section);
        });

        return () => {
            sections.forEach((section) => {
                observer.unobserve(section);
            });
        };
    }, []);

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigate("/signin");
    };

    const checkout = async () => {
        const response = await fetch("/api/create-checkout-session", {
              method: "POST",
              headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.jwtToken
              },
              body: JSON.stringify({ amount: 2000 }),
            })
        const data = await response.json();
        window.location.href = data.url
    }

    return (
        <>
            <div className="home-container">
                <div className="full-screen">
                    <div className="image-container">
                        <img src={nurseImage} alt="Nurse" className="nurse-image" />
                        <div className="overlay"></div>
                        <div className="mission-text">
                            <h2>Our Mission</h2>
                            <p>
                                Our mission is to revolutionize healthcare staffing by connecting travel nurses with hospitals
                                seamlessly. We provide a user-friendly platform where nurses can find opportunities that match
                                their certifications, schedule, and location, while hospitals can efficiently hire qualified
                                professionals to meet their staffing needs. By streamlining the hiring process, we aim to
                                enhance workforce flexibility, reduce staffing shortages, and improve patient care. Our
                                commitment is to empower healthcare professionals with greater career mobility and ensure
                                hospitals have access to top-tier talent when they need it most.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="scroll-section">
                    <img src={nurse} alt="Nurse" className="nurse-image" />
                    <div className="overlay"></div>
                    <div className="benefits-text">
                        <h2>Nurse Benefits</h2>
                        <ul className="styled-list">
                            <li>Flexible Job Opportunities</li>
                            <li>Direct Hospital Hiring</li>
                            <li>Personalized Matching</li>
                            <li>Streamlined Application Process</li>
                        </ul>
                        <button onClick={() => navigate("/signup")} className="signup-button">
                            Sign Up
                        </button>
                    </div>
                </div>

                <button onClick={checkout}>Checkout</button>

                <div className="hospital">
                    <img src={hospital} alt="hospital" className="hospital-image" />
                    <div className="overlay1"></div>
                    <div className="hospital-benefits-text">
                        <h2>Hospital Benefits</h2>
                        <ul className="styled-list">
                            <li>Access to Qualified Nurses</li>
                            <li>Efficient Hiring Process</li>
                            <li>Real-Time Nurse Availability</li>
                            <li>Custom Job Posting & Filtering</li>
                        </ul>
                        <button onClick={() => navigate("/signup")} className="signup-button">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default Dummy;
