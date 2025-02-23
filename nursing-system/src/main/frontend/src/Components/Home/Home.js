import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Keep only useNavigate, remove Router
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import nurseImage from "../../Assets/viki-mohamad-hYcSP6SpoK0-unsplash.jpg";
import nurse from "../../Assets/national-cancer-institute-701-FJcjLAQ-unsplash 2.jpg";
import hospital from "../../Assets/branimir-balogovic-fAiQRv7FgE0-unsplash.jpg";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

const Home = () => {
  const navigate = useNavigate(); // ✅ useNavigate now works correctly

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
                Our mission is to revolutionize healthcare staffing by
                connecting travel nurses with hospitals seamlessly...
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
              <li>
                <i className="bi bi-circle-fill"></i> Flexible Job Opportunities
              </li>
              <li>
                <i className="bi bi-circle-fill"></i> Direct Hospital Hiring
              </li>
              <li>
                <i className="bi bi-circle-fill"></i> Personalized Matching
              </li>
              <li>
                <i className="bi bi-circle-fill"></i> Streamlined Application
                Process
              </li>
            </ul>
            <br />
            <button
              onClick={() => navigate("/signup")}
              className="signup-button"
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="hospital">
          <img src={hospital} alt="hospital" className="hospital-image" />
          <div className="overlay1"></div>
          <div className="hospital-benefits-text">
            <h2>Hospital Benefits</h2>
            <ul className="styled-list">
              <li>
                <i className="bi bi-circle-fill"></i> Access to Qualified Nurses
              </li>
              <li>
                <i className="bi bi-circle-fill"></i> Efficient Hiring Process
              </li>
              <li>
                <i className="bi bi-circle-fill"></i> Real-Time Nurse
                Availability
              </li>
              <li>
                <i className="bi bi-circle-fill"></i> Custom Job Posting &
                Filtering
              </li>
            </ul>
            <br />
            <button
              onClick={() => navigate("/signup")}
              className="signup-button"
            >
              Sign Up
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Home;
